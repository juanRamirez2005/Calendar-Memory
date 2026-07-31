# Genera los iconos de la app (launcher + notificacion) en android/app/src/main/res.
#
# Concepto: hoja de calendario con un check dentro, sobre degradado indigo->violeta
# (los mismos primary/accent de src/theme). El glifo se dibuja una sola vez y se
# reutiliza en las tres salidas: launcher legacy, foreground adaptativo y statusbar.
#
# Uso:  powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1

Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

$ResDir = (Resolve-Path (Join-Path $PSScriptRoot '..\android\app\src\main\res')).Path

$GradientFrom = [System.Drawing.Color]::FromArgb(255, 0x63, 0x66, 0xF1)  # primary
$GradientTo   = [System.Drawing.Color]::FromArgb(255, 0x8B, 0x5C, 0xF6)  # violeta
$White        = [System.Drawing.Color]::White

# mdpi es la unidad base (1dp = 1px); el resto son multiplicadores de densidad.
$Densities = [ordered]@{
  'mdpi'    = 1.0
  'hdpi'    = 1.5
  'xhdpi'   = 2.0
  'xxhdpi'  = 3.0
  'xxxhdpi' = 4.0
}

function New-RoundedRectPath {
  param([float]$X, [float]$Y, [float]$W, [float]$H, [float]$R, [switch]$FlatBottom)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $R * 2
  $path.AddArc($X, $Y, $d, $d, 180, 90)
  $path.AddArc($X + $W - $d, $Y, $d, $d, 270, 90)
  if ($FlatBottom) {
    $path.AddLine($X + $W, $Y + $H, $X, $Y + $H)
  } else {
    $path.AddArc($X + $W - $d, $Y + $H - $d, $d, $d, 0, 90)
    $path.AddArc($X, $Y + $H - $d, $d, $d, 90, 90)
  }
  $path.CloseFigure()
  return $path
}

# Dibuja el glifo dentro de un cuadro de lado $Size con esquina superior izquierda
# en ($OffsetX,$OffsetY). Coordenadas internas en una rejilla de 100x100.
function Add-Glyph {
  param(
    [System.Drawing.Graphics]$G,
    [float]$OffsetX,
    [float]$OffsetY,
    [float]$Size,
    [System.Drawing.Color]$Color
  )

  $s = $Size / 100.0
  $tx = { param($v) $OffsetX + $v * $s }
  $ty = { param($v) $OffsetY + $v * $s }

  $brush = New-Object System.Drawing.SolidBrush $Color

  # Anillas superiores
  foreach ($ringX in 27, 65) {
    $ring = New-RoundedRectPath (& $tx $ringX) (& $ty 2) (8 * $s) (24 * $s) (4 * $s)
    $G.FillPath($brush, $ring)
    $ring.Dispose()
  }

  # Cabecera solida de la hoja (esquinas superiores redondeadas, base recta)
  $header = New-RoundedRectPath (& $tx 10) (& $ty 16) (80 * $s) (26 * $s) (12 * $s) -FlatBottom
  $G.FillPath($brush, $header)
  $header.Dispose()

  # Marco de la hoja
  $frame = New-RoundedRectPath (& $tx 10) (& $ty 16) (80 * $s) (78 * $s) (12 * $s)
  $framePen = New-Object System.Drawing.Pen($Color, (8 * $s))
  $framePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $G.DrawPath($framePen, $frame)
  $framePen.Dispose()
  $frame.Dispose()

  # Check
  $checkPen = New-Object System.Drawing.Pen($Color, (11 * $s))
  $checkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $checkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $checkPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $check = New-Object System.Drawing.Drawing2D.GraphicsPath
  $check.AddLine((& $tx 30), (& $ty 70), (& $tx 45), (& $ty 83))
  $check.AddLine((& $tx 45), (& $ty 83), (& $tx 72), (& $ty 55))
  $G.DrawPath($checkPen, $check)
  $check.Dispose()
  $checkPen.Dispose()

  $brush.Dispose()
}

function New-IconBitmap {
  param(
    [int]$Size,
    [ValidateSet('square', 'round', 'transparent')][string]$Shape,
    [float]$GlyphRatio
  )

  $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  if ($Shape -ne 'transparent') {
    $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
      (New-Object System.Drawing.PointF(0, 0)),
      (New-Object System.Drawing.PointF([float]$Size, [float]$Size)),
      $GradientFrom,
      $GradientTo
    )
    if ($Shape -eq 'round') {
      $g.FillEllipse($gradient, 0, 0, $Size - 1, $Size - 1)
    } else {
      $bg = New-RoundedRectPath 0 0 ($Size - 1) ($Size - 1) ($Size * 0.225)
      $g.FillPath($gradient, $bg)
      $bg.Dispose()
    }
    $gradient.Dispose()
  }

  $glyphSize = $Size * $GlyphRatio
  $offset = ($Size - $glyphSize) / 2
  Add-Glyph -G $g -OffsetX $offset -OffsetY $offset -Size $glyphSize -Color $White

  $g.Dispose()
  return $bmp
}

function Save-Icon {
  param([System.Drawing.Bitmap]$Bitmap, [string]$Directory, [string]$Name)
  if (-not (Test-Path $Directory)) {
    New-Item -ItemType Directory -Path $Directory -Force | Out-Null
  }
  $path = Join-Path $Directory "$Name.png"
  $Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $Bitmap.Dispose()
  Write-Host "  $($path.Substring($ResDir.Length + 1))"
}

Write-Host "Generando iconos en $ResDir"

foreach ($density in $Densities.Keys) {
  $scale = $Densities[$density]
  $mipmap = Join-Path $ResDir "mipmap-$density"
  $drawable = Join-Path $ResDir "drawable-$density"

  # Launcher legacy (Android < 8): 48dp, el glifo ocupa el 60% del lienzo.
  Save-Icon (New-IconBitmap -Size ([int](48 * $scale)) -Shape 'square' -GlyphRatio 0.60) $mipmap 'ic_launcher'
  Save-Icon (New-IconBitmap -Size ([int](48 * $scale)) -Shape 'round' -GlyphRatio 0.60) $mipmap 'ic_launcher_round'

  # Foreground adaptativo (Android 8+): lienzo de 108dp, glifo dentro de la zona
  # segura central de 66dp. Se reutiliza como capa monochrome (Android 13+).
  Save-Icon (New-IconBitmap -Size ([int](108 * $scale)) -Shape 'transparent' -GlyphRatio 0.42) $mipmap 'ic_launcher_foreground'

  # Icono de statusbar: silueta blanca sobre transparente, 24dp.
  Save-Icon (New-IconBitmap -Size ([int](24 * $scale)) -Shape 'transparent' -GlyphRatio 0.83) $drawable 'ic_stat_notification'
}

Write-Host "Listo."
