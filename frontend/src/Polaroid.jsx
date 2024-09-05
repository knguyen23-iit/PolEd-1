import './Polaroid.css';
import { useState, useRef, useEffect } from 'react';
import ImageCropDialog from './ImageCropDialog';
import AutoCrop from './AutoCrop';
import { Slider } from '@mui/material';
import BackButton from '../BackButton';


// Dynamically import all images from the "public/images" folder
const images = import.meta.glob('../public/filtered-images/*.{png,jpg,jpeg,svg, JPG}');

// Convert the imported images into an array of objects with id and imageUrl
const initData = Object.keys(images).map((path, index) => {
  return {
    id: index + 1,
    imageUrl: path.replace('../public/', '/'),
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: null,
    rotation: { value: 0, text: '0' },
    croppedImageUrl: null,
  };
});

const autoCropBoolean = initData.map((item, index) => {
  return (
    {
      id: index + 1,
      autoCropped: true,
    }
  );
});

const DEFAULT_OPTIONS = [
  {
    name: 'Brightness',
    property: 'brightness',
    value: 100,
    range: {
      min: 0,
      max: 200
    },
    unit: '%'
  },
  {
    name: 'Saturation',
    property: 'saturate',
    value: 100,
    range: {
      min: 0,
      max: 200
    },
    unit: '%'
  }
];

const saturateMarks = [
  {
    value: 128,
    label: '28',
  }
];

function Polaroid() {
  const [images, setImages] = useState(initData);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedData, setSelectedData] = useState(autoCropBoolean);
  const [displayEditBox, setDisplayEditBox] = useState(true);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [brightness, setBrightness] = useState(DEFAULT_OPTIONS[0].value);
  const [saturation, setSaturation] = useState(DEFAULT_OPTIONS[1].value);


  // Create an array of refs
  const autoCropRefs = useRef([]);

  const onCancel = () => {
    setSelectedImage(null);
  };

  const setCroppedImageFor = (id, crop, zoom, aspect, rotation, croppedImageUrl) => {
    const newImagesList = [...images];
    const imageIndex = images.findIndex(x => x.id === id)
    const image = images[imageIndex];
    const newImage = { ...image, croppedImageUrl, crop, zoom, aspect, rotation };
    newImagesList[imageIndex] = newImage;
    setImages(newImagesList);
    setSelectedImage(null);
  };

  const setAutoCroppedImageFor = (id, crop, zoom, aspect, croppedImageUrl, rotation) => {
    const newImagesList = [...images];
    const imageIndex = images.findIndex(x => x.id === id)
    const image = images[imageIndex];
    const newImage = { ...image, croppedImageUrl, crop, zoom, aspect, rotation };
    newImagesList[imageIndex] = newImage;
    setImages(newImagesList);
    finishAutoCropped(id);
  };

  const resetImage = (id) => {
    setCroppedImageFor(id);
  };

  const finishAutoCropped = (id) => {
    const newSelectedData = [...selectedData];
    const dataIndex = id - 1;
    const data = newSelectedData[dataIndex];
    const newData = { ...data, autoCropped: false };
    newSelectedData[dataIndex] = newData;
    setSelectedData(newSelectedData);
  };

  // Function to trigger crop on all AutoCrop components
  const triggerAutoCrop = () => {
    autoCropRefs.current.forEach((ref) => {
      if (ref && ref.triggerCrop) {
        ref.triggerCrop(); // Call the crop function programmatically
      }
    });
  };

  // Automatically trigger cropping when the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (autoCropRefs.current.length > 0) {
        triggerAutoCrop();
      }
    }, 500); // 1000ms delay to ensure all refs are assigned and components are rendered

    return () => clearTimeout(timer); // Cleanup the timer
  }, [selectedData]);


  //Open and Close the Edit Box
  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'a') {
      setDisplayEditBox(!displayEditBox);
    }
  });

  function handleBrightChange({ target }) {
    setBrightness(target.value);
  };

  function handleSaturationChange({ target }) {
    setSaturation(target.value)
  };

  function getImageStyle() {
    const filters = `brightness(${brightness}%) saturate(${saturation}%)`

    return { filter: filters };
  }

  let imageFilters = getImageStyle();

  return (
    <div>
      {selectedData.map((item, index) => {
        return (
          item.autoCropped
            ?
            <AutoCrop
              key={item.id}
              id={initData[index].id}
              imageUrl={initData[index].imageUrl}
              cropInit={initData[index].crop}
              zoomInit={initData[index].zoom}
              aspectInit={initData[index].aspect}
              rotationInit={initData[index].rotation}
              onCancel={onCancel}
              setAutoCroppedImageFor={setAutoCroppedImageFor}
              resetImage={resetImage}
              ref={(el) => (autoCropRefs.current[index] = el)} // Assigning ref to each AutoCrop component
            />
            :
            null
        )
      })}
      {selectedImage
        ?
        <ImageCropDialog
          id={selectedImage.id}
          imageUrl={selectedImage.imageUrl}
          cropInit={selectedImage.crop}
          zoomInit={selectedImage.zoom}
          aspectInit={selectedImage.aspect}
          rotationInit={selectedImage.rotation}
          onCancel={onCancel}
          setCroppedImageFor={setCroppedImageFor}
          resetImage={resetImage}
        />
        :
        null
      }
      <div className='image-container'>
        {images.map((image) => {
          return (
            <div className='gridElement' key={image.id}>
              <div className="imageBracket" >
                <div className='imageCard'>
                  <img
                    src={image.croppedImageUrl || image.imageUrl}
                    style={getImageStyle()}
                    alt=''
                    onClick={() => {
                      setSelectedImage(image)
                    }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {displayEditBox
        ?
        <div className='edit-box'>
          <BackButton />
          <p>Click "a" to hide this box</p>
        </div>
        :
        null
      }

    </div>

  )
}

export default Polaroid
