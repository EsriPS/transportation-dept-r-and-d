import os
import sys
import time
import json
import logging
import hashlib
import configparser
import datetime
import copy
from pathlib import Path

try:
    from arcgis.gis import GIS
except Exception as ex:
    print(f"ERROR: Failed to import ArcGIS GIS module: {ex}, signin to ArcGIS pro may be required to initialize the ArcGIS Python API environment.")
    sys.exit(1)
        
# from sqlalchemy import false

# ---------------------------------------------------------------------------
# ServiceUpdater.py
#
# Purpose:
#   Search for Web Maps in a configured ArcGIS Online/Portal instance and
#   update service URLs referenced by operational layers in each Web Map.
#
#   - backup_enabled (true/false) in config
#   - Always writes JSON backups when backup_enabled=true (dry_run or live)
#   - Backups written BEFORE any modifications
#   - Backups stored in a run-stamped folder to avoid overwrites
#
# Execution:
#   "C:\Program Files\ArcGIS\Pro\bin\Python\envs\arcgispro-py3\python.exe" serviceupdater.py
#
# Notes:
#   - Only operationalLayers[].url is evaluated/updated.
#   - No other Web Map JSON parts are modified.
# ---------------------------------------------------------------------------


def setup_logger(log_folder: str) -> str:
    os.makedirs(log_folder, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path = os.path.join(log_folder, f"{timestamp}_ServiceUpdater.log")

    logging.basicConfig(
        filename=log_path,
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # First log record: start time
    logMessage(f"Start time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    return log_path


def read_config(config_path: str) -> dict:
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Config file not found: {config_path}")

    cfg = configparser.ConfigParser()
    cfg.read(config_path)

    portal_url = cfg["arcgis"]["portal_url"].strip()
    username = cfg["arcgis"]["username"].strip()
    password = cfg["arcgis"]["password"].strip()

    from_url = cfg["urls"]["from_url"].strip().rstrip("/")
    to_url = cfg["urls"]["to_url"].strip().rstrip("/")
    to_itemid = cfg["urls"]["to_itemid"].strip().rstrip("/")

    webmap_search_query = 'type:"Web Map"'
    if cfg.has_section("search") and cfg.has_option("search", "webmap_search_query"):
        # q = cfg.get("search", "webmap_search_query").strip()
        q = cfg["search"]["webmap_search_query"].strip()
        if q:
            webmap_search_query = q

    dry_run = cfg.getboolean("run", "dry_run", fallback=True)
    log_folder = cfg["run"]["log_folder"].strip()

    max_matching_webmaps_to_process = cfg.getint("run", "max_matching_webmaps_to_process", fallback=-1)

    backup_enabled = cfg.getboolean("run", "backup_enabled", fallback=True)

    # Optional: allow user to specify a backup_root folder; otherwise derive from log_folder
    backup_root = ""
    if cfg.has_option("run", "backup_root"):
        backup_root = cfg.get("run", "backup_root").strip()

    return {
        "portal_url": portal_url,
        "username": username,
        "password": password,
        "from_url": from_url,
        "to_url": to_url,
        "to_itemid": to_itemid,
        "webmap_search_query": webmap_search_query,
        "dry_run": dry_run,
        "log_folder": log_folder,
        "max_matching_webmaps_to_process": max_matching_webmaps_to_process,
        "backup_enabled": backup_enabled,
        "backup_root": backup_root
    }


def safe_filename(text: str) -> str:
    # Keep it Windows-friendly
    keep = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 _-().")
    cleaned = "".join(ch for ch in text if ch in keep).strip()
    return cleaned if cleaned else "untitled"


def compute_sha256(obj: dict) -> str:
    # Stable hash for auditing (sorted keys)
    payload = json.dumps(obj, sort_keys=True, ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def backup_webmap_json(item, webmap_data: dict, backup_folder: str) -> str:
    """
    Writes a JSON backup for the web map item.
    File naming is deterministic by item id (plus title for readability).
    """
    os.makedirs(backup_folder, exist_ok=True)

    title_part = safe_filename(getattr(item, "title", ""))
    filename = f"{item.id}_{title_part}.json" if title_part else f"{item.id}.json"
    backup_path = os.path.join(backup_folder, filename)

    with open(backup_path, "w", encoding="utf-8") as f:
        json.dump(webmap_data, f, indent=2, ensure_ascii=False)

    return backup_path


def get_webmaps_via_search(gis: GIS, query: str, max_webmaps: int):
    """
    Uses the straightforward approach:
      gis.content.search(query=..., max_items=-1)
    then applies max_webmaps:
      -1 => all
       N => first N
    """
    items = gis.content.search(query=query, max_items=-1)

    # Defensive filter
    webmaps = [it for it in items if getattr(it, "type", None) == "Web Map"]

    if max_webmaps is None or max_webmaps == -1 or max_webmaps < -1:
        return webmaps

    return webmaps[:max_webmaps]

def update_webmap_operational_layers(webmap_data: dict, from_url: str, to_url: str, to_itemid: str, dry_run: bool, webmap_item_id: str) -> tuple:
    """
    Scans operationalLayers[].url for matches and optionally updates them.

    Returns:
      (matches_found, changes_applied, match_count, applied_count)
    """
    matches_found = False
    changes_applied = False
    match_count = 0
    applied_count = 0

    operational_layers = webmap_data.get("operationalLayers", [])
    if not isinstance(operational_layers, list):
        logging.warning(f"WebMap {webmap_item_id} | operationalLayers is not a list; cannot process.")
        return matches_found, changes_applied, match_count, applied_count

    for layer in operational_layers:
        if not isinstance(layer, dict):
            continue

        layer_url = layer.get("url")
        layer_id = layer.get("id", "<no id>")

        if not layer_url:
            continue

        normalized_layer_url = layer_url.rstrip("/")
        if normalized_layer_url.startswith(from_url):
            matches_found = True
            match_count += 1

            new_url = normalized_layer_url.replace(from_url, to_url, 1)
            if layer_url.endswith("/") and not new_url.endswith("/"):
                new_url += "/"

            logMessage(
                f"WebMap {webmap_item_id} | UPDATING Layer {layer_id} | FROM: {layer_url} | TO: {new_url}"
            )

            if not dry_run:

                if "itemId" in layer:
                    old_item_id = layer.get("itemId")
                    from_itemid = old_item_id if old_item_id else "null string"
                    new_itemid = to_itemid if to_itemid else ""
                    layer["itemId"] = new_itemid
                    logMessage(
                        f"WebMap {webmap_item_id} | UPDATING Layer  {layer_id} | FROM: {from_itemid} | TO: {new_itemid if new_itemid else 'null string'}"
                    )

                layer["url"] = new_url
                changes_applied = True
                applied_count += 1

    return matches_found, changes_applied, match_count, applied_count

def logMessage(message="", console=True):
    logging.info(message)
    if console:
        print(message)

def main():

    start_epoch = time.time()
    
    SCRIPT_DIR = Path(__file__).resolve().parent
    config_path = SCRIPT_DIR / "serviceupdater.ini"

    if len(sys.argv) > 1:
        config_path = sys.argv[1]

    try:
        settings = read_config(config_path)
    except Exception as ex:
        print(f"ERROR: Failed to read config file: {ex}")
        sys.exit(1)

    try:
        log_path = setup_logger(settings["log_folder"])
    except Exception as ex:
        print(f"ERROR: Failed to initialize logging: {ex}")
        sys.exit(1)

    # Log settings (do not log password)
    logMessage(f"Config file: {os.path.abspath(config_path)}")
    logMessage(f"Portal URL: {settings['portal_url']}")
    logMessage(f"Username: {settings['username']}")
    logMessage(f"From URL: {settings['from_url']}")
    logMessage(f"To URL: {settings['to_url']}")
    logMessage(f"To Item ID: {settings['to_itemid']}")
    logMessage(f"Dry run: {settings['dry_run']}")

    # default to processing all matching webmaps, but allow user to set a limit for testing
    max_matching_webmaps_to_process = settings.get("max_matching_webmaps_to_process", -1)
    logMessage(f"max_matching_webmaps_to_process: {max_matching_webmaps_to_process}")

    logMessage(f"webmap_search_query: {settings['webmap_search_query']}")
    logMessage(f"backup_enabled: {settings['backup_enabled']}")

    # Determine backup folder for this run (timestamped)
    run_ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    if settings["backup_root"]:
        backup_run_folder = os.path.join(settings["backup_root"], f"webmap_backups_{run_ts}")
    else:
        backup_run_folder = os.path.join(settings["log_folder"], "webmap_backups", f"webmap_backups_{run_ts}")

    if settings["backup_enabled"]:
        logMessage(f"Backup run folder: {backup_run_folder}")

    # Connect
    try:
        gis = GIS(settings["portal_url"], settings["username"], settings["password"])
        logMessage("Successfully connected to portal.")
    except Exception as ex:
        logging.error(f"Failed to connect to portal: {ex}")
        elapsed = round(time.time() - start_epoch, 2)
        logging.info(f"Elapsed seconds: {elapsed}")
        logging.info(f"Log file: {log_path}")
        sys.exit(1)

    # Search web maps
    logMessage("Searching for Web Maps...")
    # webmaps = get_webmaps_via_search(
    #     gis=gis,
    #     query=settings["webmap_search_query"],
    #     max_webmaps=settings["max_webmaps"]
    # )
    webmaps = get_webmaps_via_search(
        gis=gis,
        query=settings["webmap_search_query"],
        max_webmaps=-1
    )

    logMessage(f"Total Web Maps returned: {len(webmaps)}")

    # Overall counters
    webmaps_scanned = 0
    webmaps_with_matches = 0
    webmaps_saved = 0
    total_match_count = 0
    total_applied_count = 0
    backups_written = 0

    logMessage("Beginning webmap processing...")

    for item in webmaps:
        webmaps_scanned += 1
        webmap_item_id = item.id
        webmap_title = getattr(item, "title", "<no title>")

        logMessage(f"--- Processing WebMap {webmap_item_id} | Title: {webmap_title} ---")

        # Load webmap JSON
        try:
            webmap_data = item.get_data()
        except Exception as ex:
            logging.error(f"WebMap {webmap_item_id} | Failed to read webmap data: {ex}")
            continue

        if "operationalLayers" not in webmap_data:
            logMessage(f"WebMap {webmap_item_id} | No operationalLayers found. Skipping.")
            continue

        original_webmap_data = copy.deepcopy(webmap_data)
        
        # Process operational layer URLs
        matches_found, changes_applied, match_count, applied_count = update_webmap_operational_layers(
            webmap_data=webmap_data,
            from_url=settings["from_url"],
            to_url=settings["to_url"],
            to_itemid=settings["to_itemid"],
            dry_run=settings["dry_run"],
            webmap_item_id=webmap_item_id
        )

        if matches_found:
            webmaps_with_matches += 1
            total_match_count += match_count

        if changes_applied:
            total_applied_count += applied_count

        # Save if live mode and changes applied
        if matches_found:

            # Backup BEFORE any modifications (even in dry_run)
            if settings["backup_enabled"]:
                try:
                    # sha = compute_sha256(webmap_data)
                    backup_path = backup_webmap_json(item, original_webmap_data, backup_run_folder)
                    backups_written += 1
                    logMessage(f"WebMap {webmap_item_id} | Backup written: {backup_path}")
                    # logging.info(f"WebMap {webmap_item_id} | Backup SHA256: {sha}")
                except Exception as ex:
                    # Backup failure should be loud; skip updating for safety
                    logging.error(f"WebMap {webmap_item_id} | Backup FAILED (skipping update for safety): {ex}")
                    continue

            if settings["dry_run"]:
                logMessage(f"WebMap {webmap_item_id} | Dry run enabled – changes detected but not saved.")
            else:
                if changes_applied:
                    try:
                        item.update(data=webmap_data)
                        webmaps_saved += 1
                        logMessage(f"WebMap {webmap_item_id} | Updated and saved successfully.")
                    except Exception as ex:
                        logging.error(f"WebMap {webmap_item_id} | Failed to save updates: {ex}")
                else:
                    logMessage(f"WebMap {webmap_item_id} | Matches found but no changes were applied.")
        else:
            logMessage(f"WebMap {webmap_item_id} | No matching URLs found – no updates required.")

        # Per-webmap summary
        logMessage(
            f"WebMap {webmap_item_id} | Summary | Matches found: {matches_found} (count={match_count}) | "
            f"Changes applied: {changes_applied} (count={applied_count})"
        )

        if max_matching_webmaps_to_process != -1 and webmaps_saved == max_matching_webmaps_to_process:
            logMessage(f"Reached max_matching_webmaps_to_process limit of {max_matching_webmaps_to_process}. Skipping further processing.")
            break

    # Overall summary
    logMessage(
        "Overall Summary | "
        f"WebMaps scanned: {webmaps_scanned} | "
        f"WebMaps w/ matches: {webmaps_with_matches} | "
        f"Total matching layer URLs found: {total_match_count} | "
        f"Total changes applied: {total_applied_count} | "
        f"WebMaps saved: {webmaps_saved} | "
        f"Backups written: {backups_written} | "
        f"Dry run: {settings['dry_run']} | "
        f"Backup enabled: {settings['backup_enabled']}"
    )

    elapsed = round(time.time() - start_epoch, 2)
    logMessage(f"Elapsed seconds: {elapsed}")
    logMessage(f"Log file: {log_path}")


if __name__ == "__main__":
    main()