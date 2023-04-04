import arcpy
import sys
import os

#
# -------------------------------------------------------------------------------
# This is a simple ALRS comparison tool. 
# 
# It compares these fields for two different ALRSs
#
#   name,aliasName,isNullable,type,length
#
# additionally, the total number of FCs in each ALRS is used to determine differences
#
# Typical usage:
#   python ALRSDiff.py "connection-1" "connection-2" ["skiptext", "skipText-n"]
#   note: the ["skiptext", "skipText-n"] is optional
#
# -------------------------------------------------------------------------------
#

# -------------------------------------------------------------------------------
#  skipFC 
# -------------------------------------------------------------------------------

def skipFC(skipTextList, fc):
    if (skipTextList == None):
        return False
    elif any(skipText in fc.lower() for skipText in skipTextList):
        return True
    else:
        return False

# -------------------------------------------------------------------------------
#  getALRSFDSContents 
# -------------------------------------------------------------------------------

def getALRSContents(sdeConnection, skipTextList):

    contentList = []

    endOfConnectionInfo = sdeConnection.lower().find('.sde/')

    sdeConnectionOnly = sdeConnection[0:endOfConnectionInfo+4]

    ALRS_NAME = sdeConnection[endOfConnectionInfo+5:]
    
    print(f"\n...processing ALRS: {ALRS_NAME}")

    arcpy.env.workspace = sdeConnectionOnly

    fds = arcpy.ListFeatureClasses(feature_dataset=ALRS_NAME)
    
    for fc in fds:
        if (not skipFC(skipTextList, fc)):

            print(f"...getting field info for: {fc}")

            path = os.path.join(arcpy.env.workspace, ALRS_NAME, fc)
            
            fields = arcpy.ListFields(path)

            fieldInfo = None
            
            for field in fields:
                if (fieldInfo):
                    fieldInfo += f",{field.name},{field.aliasName},{field.isNullable},{field.type},{field.length}"
                else:
                    fieldInfo = f"{field.name},{field.aliasName},{field.isNullable},{field.type},{field.length}"
                    
            entityInfo = f"{fc},{fieldInfo}"

            contentList.append(entityInfo)
        else:
            print(f"...Skipped: {fc}")

    print(f"...processed {len(contentList)} featureclasses")  

    if (len(contentList) > 0):
        return contentList
    else:
        return None	
    
# -------------------------------------------------------------------------------
# main processing
# -------------------------------------------------------------------------------

print("ALRSDiff started")

print("...verifying command line args")
if (len(sys.argv) not in {3,4} or 
    (len(sys.argv) in {3,4} and sys.argv[1].lower().find('.sde/') == -1 or 
    sys.argv[2].lower().find('.sde/') == -1)):
    print("ALRSDiffs aborted")
    print("...invalid or missing command line arguments")
    print("...expected alrsdiff connection-1.sde/alrs connection-2.sde/alrs optionalSkipText")
    print("...where connection-# is an sde connection file pointing to a egdb with an ALRS FDS")
    sys.exit()

if (len(sys.argv) == 4):
    skipTextList = sys.argv[3].lower().split(',')
else:
    skipTextList = None

testList = getALRSContents(sys.argv[1], skipTextList)

prodList = getALRSContents(sys.argv[2], skipTextList)

try:
    print("...analyzing for differences\n")

    existsInTestAndNotProd = list(set(testList) - set(prodList))
    if (len(existsInTestAndNotProd) > 0 or len(testList) != len(prodList)):
        print("...ALRSs are NOT IDENTICAL")
        print("\n...results that exists in connection-1 and not connection-2")
        for i in range(0, len(existsInTestAndNotProd)):
            print("\n" + existsInTestAndNotProd[i])

    existsInProdAndNotTest = list(set(prodList) - set(testList))
    if (len(existsInProdAndNotTest) > 0):
        print("\n...results that exists in connection-2 and not connection-1")
        for i in range(0, len(existsInProdAndNotTest)):
            print("\n" + existsInProdAndNotTest[i])

    if(len(existsInTestAndNotProd) == 0 and len(existsInProdAndNotTest) == 0):
        print("...ALRSs are IDENTICAL")

except Exception as e:
    print(f"getALRSContents failed: {e}")

print("\nALRSDiff completed")