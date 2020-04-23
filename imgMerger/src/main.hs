import System.Environment (getArgs)
import Codec.Picture
import Codec.Picture.Png
import Codec.Picture.Types
import Data.Vector.Storable ((!))
import Data.ByteString as BYTESTRING (readFile)
import Data.ByteString.Lazy (putStr, ByteString)
import System.Exit
import System.IO (stderr)

getRatio :: IO Float
getRatio = do
    args <- getArgs
    return (read (args !! 0) :: Float)


getImagePathA :: IO String
getImagePathA = do
    args <- getArgs
    return (args !! 1)


getImagePathB :: IO String
getImagePathB = do
    args <- getArgs
    return (args !! 2)


--getImageA :: IO DynamicImage
getImageA = do
    imagePathA <- getImagePathA
    imageABuffer <- BYTESTRING.readFile imagePathA
    return (decodePng imageABuffer)


--getImageB :: IO DynamicImage
getImageB = do
    imagePathB <- getImagePathB
    imageBBuffer <- BYTESTRING.readFile imagePathB
    return (decodePng imageBBuffer)


fallOverAndDie :: String -> IO a
fallOverAndDie err = do putStrLn err
                        exitWith (ExitFailure 1)


getWidth :: Image PixelRGBA8 -> Int
getWidth a = imageWidth a


getHeight :: Image PixelRGBA8 -> Int
getHeight a = imageHeight a


getR :: PixelRGBA8 -> Pixel8
getR (PixelRGBA8 p _ _ _) = p


getG :: PixelRGBA8 -> Pixel8
getG (PixelRGBA8 _ p _ _) = p


getB :: PixelRGBA8 -> Pixel8
getB (PixelRGBA8 _ _ p _) = p


floatToPixel8 :: Float -> Pixel8
floatToPixel8 a = round a


pixel8ToFloat :: Pixel8 -> Float
pixel8ToFloat a = fromIntegral a


mergeChannel :: Float -> Pixel8 -> Pixel8 -> Pixel8
mergeChannel ratio p1 p2 = 
    let 
        f1 = pixel8ToFloat p1
        f2 = pixel8ToFloat p2
        rTotal = ratio + 1
        r1 =  ratio / rTotal
        r2 = (rTotal - ratio) / rTotal
        value = (f1 * r1) + (f2 *r2)
        valueAsPixel = floatToPixel8 value
    in valueAsPixel


mergePixel :: Float -> PixelRGBA8 -> PixelRGBA8 -> PixelRGBA8
mergePixel ratio p1 p2 =
    let 
        r = mergeChannel ratio (getR p1) (getR p2)
        g = mergeChannel ratio (getG p1) (getG p2)
        b = mergeChannel ratio (getB p1) (getB p2)
        newPixel = PixelRGBA8 r g b 255
    in newPixel


mergeImage :: Float -> Image PixelRGBA8 -> Image PixelRGBA8 -> DynamicImage
mergeImage ratio img1 img2 = ImageRGBA8 (generateImage (mergeSpecificPixel ratio img1 img2) (getWidth img1) ( getHeight img2))


getRgbaPixelFromImage :: Image PixelRGBA8 -> Int -> Int -> PixelRGBA8
getRgbaPixelFromImage img x y =
    let
        width = getWidth img
        pixelIndex = ((width * y) + x) * 4
        r = (imageData img) ! pixelIndex
        g = (imageData img) ! (pixelIndex + 1)
        b = (imageData img) ! (pixelIndex + 2)
        a = (imageData img) ! (pixelIndex + 3)
    in PixelRGBA8 r g b a


mergeSpecificPixel :: Float -> Image PixelRGBA8 -> Image PixelRGBA8 -> Int -> Int -> PixelRGBA8
mergeSpecificPixel ratio img1 img2 x y =
    let
        pixelImg1 = getRgbaPixelFromImage img1 x y
        pixelImg2 = getRgbaPixelFromImage img2 x y
    in mergePixel ratio pixelImg1 pixelImg2


mergeImageToBuffer :: Float -> DynamicImage -> DynamicImage -> Data.ByteString.Lazy.ByteString
mergeImageToBuffer ratio img1 img2 = 
    let
        dynImage = mergeImage ratio (convertRGBA8 img1) (convertRGBA8 img2)
        imgBuf = encodePng (convertRGBA8 dynImage)
    in imgBuf


main = do
    ratio <- getRatio
    imageAtry <- getImageA
    imageBtry <- getImageB
    case imageAtry of
        Left errA -> fallOverAndDie ("Failed to read A! " ++ errA)
        Right imageA -> case imageBtry of
            Left errB -> fallOverAndDie ("Failed to read B! " ++ errB)
            Right imageB -> Data.ByteString.Lazy.putStr (mergeImageToBuffer ratio imageA imageB)   
