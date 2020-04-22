##### NAME

imgMerger

##### SYNOPSYS

imgMerger ratio imagePathA imagePathB

##### DESCRIPTION

Merge two png images together, new image comes out of standard output.

##### EXAMPLE

	# image_a=25%; image_b=75%;
	imgMerger 0.333 image_a.png image_b.png > new_image.png
	
	# image_a=90%; image_b=10%;
	imgMerger 9.000 image_a.png image_b.png > new_image.png
