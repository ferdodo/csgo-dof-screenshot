package main


import (
    "fmt"
    "os"
    "image"
    "image/draw"
    "image/color"
    "image/png"
    _ "image/jpeg"
    "strconv"
)


func main() {
    imageAPath := os.Args[2]
    imageBPath := os.Args[3]
    imageAIOReader, err := os.Open(imageAPath)

    if err != nil {
        fmt.Println(err)
        os.Exit(-1)
    }

    imageBIOReader, err := os.Open(imageBPath)

    if err != nil {
        fmt.Println(err)
        os.Exit(-1)
    }

    imageA, _, err := image.Decode(imageAIOReader)

    if err != nil {
        fmt.Println(err)
        os.Exit(-1)
    }

    imageB, _, err := image.Decode(imageBIOReader)

    if err != nil {
        fmt.Println(err)
        os.Exit(-1)
    }

    ratioArg := os.Args[1]

    ratio, err := strconv.ParseFloat(ratioArg, 32)

    if err != nil {
        fmt.Println(err)
        os.Exit(2)
    }

    maskValue := 255-(255*(ratio/(ratio+1)))
    b := imageA.Bounds()
    mask := image.NewAlpha(b)

    for x := 0; x < b.Dx(); x++ {
        for y := 0; y < b.Dy(); y++ {
            mask.SetAlpha(x, y, color.Alpha{uint8(maskValue)})
        }
    }

    rgba := image.NewRGBA(b)
    draw.Draw(rgba, b, imageA, image.Point{0, 0}, draw.Src)
    draw.DrawMask(rgba, b, imageB, image.Point{0, 0}, mask, image.Point{0, 0}, draw.Over)

    err2 := png.Encode(os.Stdout, rgba)

    if err2 != nil {
        fmt.Println(err2)
        os.Exit(-1)
    }
}