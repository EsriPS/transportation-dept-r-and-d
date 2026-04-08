# ---------------------------------------------------------------------------
# RestoreWebMaps.py
#
# Purpose:
#   Restore ArcGIS Online (or Portal) Web Maps from JSON backup files created
#   by the ServiceUpdater utility.
#
# High-level processing:
#   1. Read all runtime settings from an external INI configuration file:
#        - portal_url, username, password
#        - backup_folder (location of JSON backups)
#        - restore_mode ("single" or "all")
#        - webmap_id (used only when restore_mode = "single")
#        - dry_run (true/false)
#        - log_folder
#
#   2. Create a timestamped log file in the configured log directory:
#        YYYYMMDD_HHMMSS_RestoreWebMaps.log
#      The first log record will be the script start time.
#
#   3. Connect to the specified ArcGIS Online / Portal instance using the
#      ArcGIS Python API.
#
#   4. Locate backup JSON files in the configured backup folder.
#        - Backup filenames are expected to follow one of these patterns:
#            <webmap_id>.json
#            <webmap_id>_<webmap_title>.json
#
#   5. Restore behavior is controlled by restore_mode:
#
#        restore_mode = "single"
#          - Locate the backup JSON corresponding to the specified webmap_id
#          - Restore only that Web Map
#
#        restore_mode = "all"
#          - Iterate over all *.json files in the backup folder
#          - Derive the Web Map ID from each filename
#          - Restore each Web Map found
#
#   6. Dry run behavior:
#        - If dry_run=true, log what would be restored but do not call item.update()
#
#   7. For each Web Map restore (when dry_run=false):
#        - Read the backup JSON from disk
#        - Update the existing Web Map item using item.update(data=...)
#        - Log success or failure for each item
#
#   8. Write a summary to the log indicating:
#        - Number of restore attempts
#        - Number of successful restores
#
#   9. Log total elapsed execution time and exit.
#
# Execution:
#   "C:\Program Files\ArcGIS\Pro\bin\Python\envs\arcgispro-py3\python.exe" restore_webmaps.py 
#
# Notes:
#   - This script performs RESTORE ONLY. It does not modify backups.
#   - Restores completely replace the Web Map JSON with the backup version.
#   - Intended for rollback after bulk Web Map updates (e.g., URL migrations).
#   - Safe to run multiple times; restores are idempotent per backup file.
# ---------------------------------------------------------------------------

import os
import sys
import json
import time
import logging
import configparser
import datetime

try:
    from arcgis.gis import GIS
except Exception as ex:
    print(f"ERROR: Failed to import ArcGIS GIS module: {ex}, signin to ArcGIS pro may be required to initialize the ArcGIS Python API environment.")
    sys.exit(1)

def setup_logger(log_folder: str) -> str:
    os.makedirs(log_folder, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path = os.path.join(log_folder, f"{timestamp}_RestoreWebMaps.log")

    logging.basicConfig(
        filename=log_path,
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    logging.info(f"Start time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    return log_path


def read_config(config_path: str) -> dict:
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Config file not found: {config_path}")

    cfg = configparser.ConfigParser()
    cfg.read(config_path)

    portal_url = cfg["arcgis"]["portal_url"].strip()
    username = cfg["arcgis"]["username"].strip()
    password = cfg["arcgis"]["password"].strip()

    backup_folder = cfg["restore"]["backup_folder"].strip()
    restore_mode = cfg.get("restore", "restore_mode", fallback="all").strip().lower()
    target_webmap_id = cfg.get("restore", "webmap_id", fallback="").strip()

    # NEW
    dry_run = cfg.getboolean("restore", "dry_run", fallback=True)

    log_folder = cfg.get("restore", "log_folder", fallback=r"C:\temp").strip()

    return {
        "portal_url": portal_url,
        "username": username,
        "password": password,
        "backup_folder": backup_folder,
        "restore_mode": restore_mode,      # "all" or "single"
        "webmap_id": target_webmap_id,     # used when restore_mode == "single"
        "dry_run": dry_run,
        "log_folder": log_folder
    }


def find_backup_file_for_id(backup_folder: str, webmap_id: str) -> str:
    """
    Finds a backup file that starts with '<webmap_id>_' or equals '<webmap_id>.json'.
    If multiple matches exist, returns the newest by modified time.
    """
    candidates = []
    for name in os.listdir(backup_folder):
        if not name.lower().endswith(".json"):
            continue

        full_path = os.path.join(backup_folder, name)
        if name == f"{webmap_id}.json" or name.startswith(f"{webmap_id}_"):
            candidates.append(full_path)

    if not candidates:
        return ""

    candidates.sort(key=lambda p: os.path.getmtime(p), reverse=True)
    return candidates[0]


def webmap_id_from_backup_filename(filename: str) -> str:
    """
    Extract the webmap id from a backup filename.
    Expected patterns:
      <id>.json
      <id>_<title>.json
    """
    base = os.path.basename(filename)
    if base.lower().endswith(".json"):
        base = base[:-5]  # remove .json

    return base.split("_")[0]


def restore_one(gis: GIS, backup_path: str, webmap_id: str, dry_run: bool) -> bool:
    """
    Restores a single web map from its backup JSON.
    If dry_run=true, logs what would happen and returns True only to indicate it was a valid candidate,
    but does not call item.update().
    """
    item = gis.content.get(webmap_id)
    if not item:
        logging.error(f"WebMap {webmap_id} | Not found in portal.")
        return False

    if dry_run:
        logMessage(f"DRY RUN | WebMap {webmap_id} | Would restore from {backup_path}")
        return True

    try:
        with open(backup_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as ex:
        logging.error(f"WebMap {webmap_id} | Failed reading backup JSON {backup_path}: {ex}")
        return False

    try:
        item.update(data=data)
        logMessage(f"WebMap {webmap_id} | Restored successfully from {backup_path}")
        return True
    except Exception as ex:
        logging.error(f"WebMap {webmap_id} | Failed to restore from {backup_path}: {ex}")
        return False

def logMessage(message="", console=True):
    logging.info(message)
    if console:
        print(message)
        
def main():
    start_epoch = time.time()

    config_path = "restore_webmaps.ini"
    if len(sys.argv) > 1:
        config_path = sys.argv[1]

    try:
        settings = read_config(config_path)
    except Exception as ex:
        print(f"ERROR: {ex}")
        sys.exit(1)

    log_path = setup_logger(settings["log_folder"])

    logMessage(f"Config file: {os.path.abspath(config_path)}")
    logMessage(f"Portal URL: {settings['portal_url']}")
    logMessage(f"Username: {settings['username']}")
    logMessage(f"Backup folder: {settings['backup_folder']}")
    logMessage(f"Restore mode: {settings['restore_mode']}")
    logMessage(f"Dry run: {settings['dry_run']}")
    if settings["restore_mode"] == "single":
        logMessage(f"Target WebMap ID: {settings['webmap_id']}")

    if not os.path.isdir(settings["backup_folder"]):
        logging.error(f"Backup folder not found or not a folder: {settings['backup_folder']}")
        sys.exit(1)

    # Connect
    try:
        gis = GIS(settings["portal_url"], settings["username"], settings["password"])
        logMessage("Successfully connected to portal.")
    except Exception as ex:
        logging.error(f"Failed to connect to portal: {ex}")
        sys.exit(1)

    restored = 0
    attempted = 0

    if settings["restore_mode"] == "single":
        webmap_id = settings["webmap_id"]
        if not webmap_id:
            logging.error("restore_mode=single but webmap_id is empty.")
            sys.exit(1)

        backup_path = find_backup_file_for_id(settings["backup_folder"], webmap_id)
        if not backup_path:
            logging.error(f"No backup JSON found for WebMap ID {webmap_id} in {settings['backup_folder']}")
            sys.exit(1)

        attempted = 1
        success = restore_one(gis, backup_path, webmap_id, settings["dry_run"])
        if success and not settings["dry_run"]:
            restored = 1

    else:
        # restore_mode == "all"
        for name in os.listdir(settings["backup_folder"]):
            if not name.lower().endswith(".json"):
                continue

            backup_path = os.path.join(settings["backup_folder"], name)
            webmap_id = webmap_id_from_backup_filename(name)

            attempted += 1
            success = restore_one(gis, backup_path, webmap_id, settings["dry_run"])
            if success and not settings["dry_run"]:
                restored += 1

    if settings["dry_run"]:
        logMessage(f"Summary | Attempted: {attempted} | Restored: 0 | (dry_run=true; no updates performed)")
    else:
        logMessage(f"Summary | Attempted: {attempted} | Restored: {restored}")

    elapsed = round(time.time() - start_epoch, 2)
    logMessage(f"Elapsed seconds: {elapsed}")
    logMessage(f"Log file: {log_path}")


if __name__ == "__main__":
    main()