# Execute like this for local images:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# .\mov_to_oid.ps1 -MovPath "C:\bob\Projects\Sales\road videos\1774466707.MOV"

# execute and expect images at url
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# .\mov_to_oid.ps1 -MovPath "C:\bob\Projects\Sales\road videos\1774466707.MOV" -BaseImageUrl "https://transdemo3.esri.com/oitester"

# default execution
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass														# Default run, images will have local file spec
# .\mov_to_oid.ps1 -MovPath "C:\bob\Projects\Sales\road videos\1774466707.MOV"

# optional flag usage as needed
# .\mov_to_oid.ps1 `
  # -MovPath "C:\bob\Projects\Sales\road videos\1774466707.MOV" `
  # -UseRawRoll `
  # -BaseImageUrl "https://transdemo3.esri.com/oitester"
  
  # -UseRawRoll `																									# if you want to use the measured camera roll, by default its set to 0
  # -BaseImageUrl "https://transdemo3.esri.com/oitester"															# use if you copy the images to the specificed URL
  

# the script automatically extracts (splits) the MOV into frames
# running it again overwrites the previous run
# Output is always clean, consistent, and OID‑safe
# This behavior is intentional and correct for ArcGIS Pro workflows


param(
  [Parameter(Mandatory=$true)]
  [string]$MovPath,

  [string]$OutDir = "",
  [int]$Fps = 1,

  # OID parameters
  [string]$SRS = "4326",              # lon/lat
  [double]$CameraHeight = 1.5,
  [double]$FarDistance = 30,          # explicit, non-null

  # Default: force roll to 0 for stable viewing. Use -UseRawRoll to keep measured roll.
  [switch]$UseRawRoll,

  # NEW: Base URL to use in the CSV ImagePath (frames are still generated locally)
  [string]$BaseImageUrl = "https://transdemo3.esri.com/oitester",

  # Tool paths
  [string]$ExifTool = "C:\bob\Projects\Sales\exiftool-13.53_64\exiftool.exe",
  [string]$Ffmpeg   = "C:\bob\Projects\Sales\ffmpeg\ffmpeg.exe"
)

# -----------------------------
# Validate
# -----------------------------
if (!(Test-Path $MovPath))  { throw "MOV not found: $MovPath" }
if (!(Test-Path $ExifTool)) { throw "ExifTool not found: $ExifTool" }
if (!(Test-Path $Ffmpeg))   { throw "ffmpeg not found: $Ffmpeg" }

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path (Split-Path -Parent $MovPath) "OID_Output"
}

$FramesDir = Join-Path $OutDir "frames"
$CsvPath   = Join-Path $OutDir "oid_table.csv"
$LocTxt    = Join-Path $OutDir "locationnotes.txt"

New-Item -ItemType Directory -Force -Path $FramesDir | Out-Null

# Normalize BaseImageUrl (no trailing slash)
if ($BaseImageUrl.EndsWith("/")) {
  $BaseImageUrl = $BaseImageUrl.TrimEnd("/")
}

Write-Host "MOV:           $MovPath"
Write-Host "OUT:           $OutDir"
Write-Host "Frames (local):$FramesDir"
Write-Host "CSV:           $CsvPath"
Write-Host "FPS:           $Fps"
Write-Host "SRS:           $SRS"
Write-Host "CameraHeight:  $CameraHeight"
Write-Host "FarDistance:   $FarDistance"
Write-Host ("CameraRoll:    " + ($(if ($UseRawRoll) { "RAW from MOV" } else { "FORCED 0 (default)" })))
Write-Host "ImagePath URL: $BaseImageUrl/<frame_file_name>.jpg"
Write-Host ""

# -----------------------------
# 1) Extract frames
# -----------------------------
Write-Host "1/3 Extracting frames..."
& $Ffmpeg -y -i $MovPath -vf "fps=$Fps" (Join-Path $FramesDir "frame_%06d.jpg") | Out-Null

$frames = Get-ChildItem $FramesDir -Filter "frame_*.jpg" | Sort-Object Name
if ($frames.Count -eq 0) { throw "No frames extracted." }

# -----------------------------
# 2) Extract LocationNote
# -----------------------------
Write-Host "2/3 Extracting LocationNote telemetry..."
& $ExifTool -ee -n -s -s -s -LocationNote $MovPath | Set-Content -Encoding ascii $LocTxt

$lines = Get-Content $LocTxt | Where-Object { $_.Trim() -ne "" }
if ($lines.Count -eq 0) { throw "No LocationNote records found." }

# -----------------------------
# 3) Write OID CSV (NO Z column)
# -----------------------------
Write-Host "3/3 Writing OID CSV..."

"X,Y,SRS,ImagePath,CameraHeading,CameraPitch,CameraRoll,CameraHeight,FarDistance,AcquisitionDate,SequenceOrder" |
  Set-Content -Encoding utf8 $CsvPath

$count = [Math]::Min($frames.Count, $lines.Count)

for ($i = 0; $i -lt $count; $i++) {

  # LocationNote format (confirmed):
  # A,YYMMDD,HHMMSS,lat,lon,ax,ay,az,speed,alt,heading,pitch,roll,extra
  $p = $lines[$i].Split(',')
  if ($p.Length -lt 13) { continue }

  $lat = [double]$p[3]
  $lon = [double]$p[4]
  $hdg = [double]$p[10]
  $pit = [double]$p[11]

  # Roll: forced to 0 by default; use -UseRawRoll to keep measured roll
  $rol = 0.0
  if ($UseRawRoll) {
    $rol = [double]$p[12]
  }

  # AcquisitionDate from YYMMDD + HHMMSS
  $yyMMdd = $p[1]
  $hhmmss = $p[2]
  $dt = (Get-Date ("20{0}-{1}-{2} {3}:{4}:{5}" -f `
        $yyMMdd.Substring(0,2),
        $yyMMdd.Substring(2,2),
        $yyMMdd.Substring(4,2),
        $hhmmss.Substring(0,2),
        $hhmmss.Substring(2,2),
        $hhmmss.Substring(4,2))).ToString("yyyy-MM-ddTHH:mm:ss")

  # LOCAL file exists, but we write a WEB URL into the OID table:
  # https://transdemo3.esri.com/oitester/frame_000001.jpg
  $fileName = $frames[$i].Name
  $imgUrl = "$BaseImageUrl/$fileName"

  # X=lon, Y=lat when SRS=4326
  "$lon,$lat,$SRS,""$imgUrl"",$hdg,$pit,$rol,$CameraHeight,$FarDistance,$dt,$($i+1)" |
    Add-Content -Encoding utf8 $CsvPath
}

Write-Host ""
Write-Host "✅ DONE"
Write-Host "Local frames: $FramesDir"
Write-Host "OID CSV:      $CsvPath"
Write-Host ""
Write-Host "NEXT:"
Write-Host "  1) Copy frames from: $FramesDir"
Write-Host "     to your web folder backing: $BaseImageUrl/"
Write-Host "  2) Create OID (Has Z = NO)"
Write-Host "  3) Add Images using oid_table.csv"
Write-Host ""
