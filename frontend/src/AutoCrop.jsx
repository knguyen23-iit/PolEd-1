import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';

const aspectRatios = [
  { value: 3 / 4, text: "3/4" },
  { value: 1 / 2, text: "1/2" },
  { value: 4 / 3, text: "4/3" },
  { value: 16 / 9, text: "16/9" },
];


const AutoCrop = forwardRef(({ id, imageUrl, cropInit, zoomInit, aspectInit, onCancel, setAutoCroppedImageFor, resetImage }, ref) => {

  if (zoomInit == null) {
    zoomInit = 1;
  };

  if (cropInit == null) {
    cropInit = { x: 0, y: 0 };
  };

  if (aspectInit == null) {
    aspectInit = aspectRatios[0];
  };

  const [zoom, setZoom] = useState(zoomInit);
  const [crop, setCrop] = useState(cropInit);
  const [aspect, setAspect] = useState(aspectInit);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Expose the onCrop function to be accessible via the ref
  useImperativeHandle(ref, () => ({
    triggerCrop: onCrop,
  }));

  //Drag the crop box around
  const onCropChange = (crop) => {
    setCrop(crop);
  };

  //Handle zoom
  const onZoomChange = (zoom) => {
    setZoom(zoom);
  }

  //Handle <select>
  const onAspectChange = (e) => {
    const value = e.target.value;
    const ratio = aspectRatios.find(ratio => (ratio.value == value));
    setAspect(ratio);
  }

  //handle cropped area
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const onCrop = async () => {
    const croppedImageUrl = await getCroppedImg(imageUrl, croppedAreaPixels);
    setAutoCroppedImageFor(id, crop, zoom, aspect, croppedImageUrl);
  }

  const onResetImage = () => {
    resetImage(id)
  };

  // const onSetDefaultImageUrl = () => {
  //   setImageUrl(id, "images/default.jpg")
  // }

  // const onSelectFile = (event) => {
  //   if (event.target.files && event.target.files.length > 0) {
  //     const file = event.target.files[0];
  //     const fileUrl = URL.createObjectURL(file);
  //     setImageUrl(id, fileUrl);
  //   }
  // };

  return (
    <div>
      <div className='backdrop'></div>
      <div className='crop-container'>
        <Cropper
          image={imageUrl}
          zoom={zoom}
          crop={crop}
          // cropSize={{ width: 200, height: 269 }}
          aspect={aspect.value}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropComplete}
        />
      </div>
      <div className='controls'>
        <div className='controls-upper-area'>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onInput={(e) => {
              onZoomChange(e.target.value)
            }}
            className='slider'
          ></input>
          <select onChange={onAspectChange}>
            {aspectRatios.map((ratio) => {
              return (
                <option
                  key={ratio.text}
                  value={ratio.value}
                >
                  {ratio.text}
                </option>
              )
            })}
          </select>
        </div>
        <div className='button-area'>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onResetImage}>Reset</button>
          <button onClick={onCrop}>Crop</button>
        </div>
      </div>
    </div>
  )
});

export default AutoCrop
