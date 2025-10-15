from arcgis.gis import GIS
from arcgis.features import FeatureLayerCollection
import pandas as pd
from urllib.parse import urlparse

#
# =====================================================================
#
# Simple script to count rows per portal url in a list of hosted tables
# and output a csv. Illustrates simpile pandas usage.
#
# Assumed table schema:
# PortalURL +
# Additional Fields1-n
#
# The resulting csv looks like this:
#
# Table         portal-name-1       portal-name-2       Portal-name-n       Total
# table-1       row-count-portal-1  row-count-portal-2  row-count-portal-n  total-all-portal-row-count
# table-2       row-count-portal-1  row-count-portal-2  row-count-portal-n  total-all-portal-row-count
# table-3       row-count-portal-1  row-count-portal-2  row-count-portal-n  total-all-portal-row-count
# Grand Total   total-row-count     total-row-count     total-row-count     Grand total all rows all portals  
#
# =====================================================================
#

def extract_portal_name(url):
    try:
        netloc = urlparse(url).netloc
        return netloc.split('.')[0] if netloc else url
    except:
        return url

def count_unique_portals(table):
    try:
        # YOUR-OUTFIELD...(used to build the summary csv)
        #
        # For this example its assumed each row has a PortalURL attribute
        # so table-1 would have rows with other fields related to the specific PortalURL
        #
        df = table.query(where="1=1", out_fields="PortalURL", as_df=True)
        if 'PortalURL' not in df.columns:
            print(f"Warning: 'PortalURL' field not found in table '{table.properties.name}'")
            return {}
        df['PortalName'] = df['PortalURL'].apply(extract_portal_name)
        return df['PortalName'].value_counts().to_dict()
    except Exception as e:
        print(f"Error querying table '{table.properties.name}': {e}")
        return {}

def main(item_id):
    gis = GIS('YOUR-ORG-NAME.maps.arcgis.com', "YOUR-USERNAME", "YOUR-PASSWORD")

    item = gis.content.get(item_id)
    if not item:
        print("Item not found.")
        return

    flc = FeatureLayerCollection.fromitem(item)
    tables = flc.tables

    # replace with YOUR table names
    expected_tables = [
        "YOUR-Table-Name-1",
        "YOUR-Table-Name-2",
        "YOUR-Table-Name-n"
    ]

    all_portals = set()
    table_portal_counts = {}

    for table_name in expected_tables:
        table = next((t for t in tables if t.properties.name == table_name), None)
        if table:
            portal_counts = count_unique_portals(table)
            table_portal_counts[table_name] = portal_counts
            all_portals.update(portal_counts.keys())
        else:
            print(f"Warning: Table '{table_name}' not found in the item.")

    all_portals = sorted(all_portals)
    rows = []

    for table_name in expected_tables:
        row = {"Table": table_name}
        total = 0
        portal_counts = table_portal_counts.get(table_name, {})
        for portal in all_portals:
            count = portal_counts.get(portal, 0)
            row[portal] = count
            total += count
        row["Total"] = total
        rows.append(row)

    df = pd.DataFrame(rows)

    grand_total_row = {"Table": "Grand Total"}

    for portal in all_portals:
        grand_total_row[portal] = df[portal].sum()

    grand_total_row["Total"] = df["Total"].sum()

    df = pd.concat([df, pd.DataFrame([grand_total_row])], ignore_index=True)

    df.to_csv("YOUR-CSV-NAME.csv", index=False)

    print("CSV saved as 'YOUR-CSV-NAME'")

if __name__ == "__main__":

    itemid = "ITEMID-THAT-CONTAINS-YOUR-HOSTED-TABLE-SERVICES"

    main(itemid)