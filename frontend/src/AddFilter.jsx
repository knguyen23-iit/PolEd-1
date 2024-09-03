import React, { useEffect, useRef, useState } from 'react';
import './AddFilter.css';
import { fabric } from 'fabric';
import BackButton from '../BackButton';
import axios from 'axios';
import { useSnackbar } from 'notistack'
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

// Dynamically import all images from the "public/images" folder
const images = import.meta.glob('../public/unfiltered-images/*.{png,jpg,jpeg,svg, JPG}');

// Convert the imported images into an array of objects with id and imageUrl
const initData = Object.keys(images).map((path, index) => {
  return {
    id: index + 1,
    imageUrl: path.replace('../public/', '/'),
  };
});

function AddFilter() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const downloadCanvasRef = useRef(null); // Non-display canvas

  // State for all filters
  const [vibrance, setVibrance] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [contrast, setContrast] = useState(0);

  const vibranceDisplayRef = useRef(null);
  const brightnessDisplayRef = useRef(null);
  const saturationDisplayRef = useRef(null);
  const contrastDisplayRef = useRef(null);

  //For notistack
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvasInstance = new fabric.Canvas(canvasRef.current);
    setCanvas(canvasInstance);

    const imageWidth = 450;
    const imageHeight = 300;
    const imagesPerRow = 2;
    const canvasWidth = imageWidth * imagesPerRow;
    const canvasHeight = Math.ceil(initData.length / imagesPerRow) * imageHeight;

    canvasInstance.setWidth(canvasWidth);
    canvasInstance.setHeight(canvasHeight);

    initData.forEach((imageData, index) => {
      fabric.Image.fromURL(imageData.imageUrl, (img) => {
        img.scaleToWidth(imageWidth);
        img.scaleToHeight(imageHeight);
        img.set({
          left: (index % imagesPerRow) * imageWidth,
          top: Math.floor(index / imagesPerRow) * imageHeight,
        });

        // Add initial filters
        img.filters.push(
          new fabric.Image.filters.Vibrance({ vibrance }),
          new fabric.Image.filters.Brightness({ brightness }),
          new fabric.Image.filters.Saturation({ saturation }),
          new fabric.Image.filters.Contrast({ contrast })
        );
        img.applyFilters();

        canvasInstance.add(img);
        canvasInstance.renderAll();
      });
    });

    return () => {
      canvasInstance.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas) return;
    updateFilters();
  }, [vibrance, brightness, saturation, contrast, canvas]);

  // Function to update filters
  const updateFilters = () => {
    if (!canvas) return;

    canvas.getObjects().forEach((img) => {
      let vibranceFilter = img.filters.find(filter => filter && filter.type === 'Vibrance');
      let brightnessFilter = img.filters.find(filter => filter && filter.type === 'Brightness');
      let saturationFilter = img.filters.find(filter => filter && filter.type === 'Saturation');
      let contrastFilter = img.filters.find(filter => filter && filter.type === 'Contrast');

      if (vibranceFilter) vibranceFilter.vibrance = vibrance;
      else {
        vibranceFilter = new fabric.Image.filters.Vibrance({ vibrance });
        img.filters.push(vibranceFilter);
      }

      if (brightnessFilter) brightnessFilter.brightness = brightness;
      else {
        brightnessFilter = new fabric.Image.filters.Brightness({ brightness });
        img.filters.push(brightnessFilter);
      }

      if (saturationFilter) saturationFilter.saturation = saturation;
      else {
        saturationFilter = new fabric.Image.filters.Saturation({ saturation });
        img.filters.push(saturationFilter);
      }

      if (contrastFilter) contrastFilter.contrast = contrast;
      else {
        contrastFilter = new fabric.Image.filters.Contrast({ contrast });
        img.filters.push(contrastFilter);
      }

      img.applyFilters();

      if (vibranceDisplayRef.current) {
        vibranceDisplayRef.current.innerText = `Vibrance: ${Math.round(vibrance * 100) / 100}`;
      }
      if (brightnessDisplayRef.current) {
        brightnessDisplayRef.current.innerText = `Brightness: ${Math.round(brightness * 100) / 100}`;
      }
      if (saturationDisplayRef.current) {
        saturationDisplayRef.current.innerText = `Saturation: ${Math.round(saturation * 100) / 100}`;
      }
      if (contrastDisplayRef.current) {
        contrastDisplayRef.current.innerText = `Contrast: ${Math.round(contrast * 100) / 100}`;
      }
    });

    canvas.renderAll();
  };

  // Function to adjust values
  const adjustValue = (property, setProperty, min, max, delta) => {
    setProperty(prev => {
      const newValue = Math.max(min, Math.min(prev + delta, max));
      return newValue;
    });
  };

  // Reset individual filters to 0
  const resetVibrance = () => setVibrance(0);
  const resetBrightness = () => setBrightness(0);
  const resetSaturation = () => setSaturation(0);
  const resetContrast = () => setContrast(0);

  // Function to download all images
  const handleDownload = () => {
    const downloadCanvas = downloadCanvasRef.current;
    const ctx = downloadCanvas.getContext('2d');
    const fabricCanvas = canvas;

    if (!fabricCanvas) {
      console.error('Fabric.js canvas instance is not available.');
      return;
    }

    // Check if fabricCanvas has the getObjects method
    if (typeof fabricCanvas.getObjects !== 'function') {
      console.error('getObjects is not a function on fabricCanvas.');
      return;
    }

    const imgObjects = fabricCanvas.getObjects('image');

    imgObjects.forEach((imgObject, index) => {
      const { width, height, scaleX, scaleY } = imgObject;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;

      downloadCanvas.width = scaledWidth;
      downloadCanvas.height = scaledHeight;

      ctx.clearRect(0, 0, scaledWidth, scaledHeight);
      ctx.drawImage(imgObject._element, 0, 0, scaledWidth, scaledHeight);

      const link = document.createElement('a');
      link.href = downloadCanvas.toDataURL('image/png');
      link.download = `bunny-${index + 1}.png`;
      link.click();
    });
  };

  // Function to save all images to the server using FormData
  const temp = () => {
    const downloadCanvas = downloadCanvasRef.current;
    const ctx = downloadCanvas.getContext('2d');
    const fabricCanvas = canvas;

    if (!fabricCanvas) {
      console.error('Fabric.js canvas instance is not available.');
      return;
    }

    const imgObjects = fabricCanvas.getObjects('image');

    imgObjects.forEach((imgObject, index) => {
      const { width, height, scaleX, scaleY } = imgObject;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;

      downloadCanvas.width = scaledWidth;
      downloadCanvas.height = scaledHeight;

      ctx.clearRect(0, 0, scaledWidth, scaledHeight);
      ctx.drawImage(imgObject._element, 0, 0, scaledWidth, scaledHeight);

      // Convert canvas to Blob
      downloadCanvas.toBlob((blob) => {
        const formData = new FormData();
        formData.append('image', blob, `bunny-${index + 1}.png`); // Append the blob as a file

        // Use Axios to send the image to the server
        axios.post('http://localhost:5000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
          .then(response => {
            console.log(`Image ${index + 1} saved successfully:`, response.data);
          })
          .catch(error => {
            console.error(`Error saving image ${index + 1}:`, error);
          });
      }, 'image/png'); // Specify the MIME type of the Blob
    });
  };

  const handleSaveToServer = () => {
    // Clear the folder first
    axios.get('http://localhost:3000/clear-folder')
      .then(() => {
        const downloadCanvas = downloadCanvasRef.current;
        const ctx = downloadCanvas.getContext('2d');
        const fabricCanvas = canvas;

        if (!fabricCanvas) {
          console.error('Fabric.js canvas instance is not available.');
          return;
        }

        const imgObjects = fabricCanvas.getObjects('image');

        imgObjects.forEach((imgObject, index) => {
          const { width, height, scaleX, scaleY } = imgObject;
          const scaledWidth = width * scaleX;
          const scaledHeight = height * scaleY;

          downloadCanvas.width = scaledWidth;
          downloadCanvas.height = scaledHeight;

          ctx.clearRect(0, 0, scaledWidth, scaledHeight);
          ctx.drawImage(imgObject._element, 0, 0, scaledWidth, scaledHeight);

          // Convert canvas to Blob
          downloadCanvas.toBlob((blob) => {
            const formData = new FormData();
            formData.append('image', blob, `bunny-${index + 1}.png`); // Append the blob as a file

            // Use Axios to send the image to the server
            axios.post('http://localhost:3000/upload', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })
              .then(response => {
                console.log(`Image ${index + 1} saved successfully:`, response.data);
              })
              .catch(error => {
                console.error(`Error saving image ${index + 1}:`, error);
              });
          }, 'image/png'); // Specify the MIME type of the Blob
        });

        enqueueSnackbar('Deleted Old Images', { variant: 'error' });
        enqueueSnackbar('Images Saved Successfully', { variant: 'success' });
      })
      .catch(error => {
        console.error('Error clearing folder:', error);
      });
  };

  return (
    <div>
      <div className='edit-box-filter'>
        <BackButton />
        <br />
        <button onClick={handleSaveToServer} style={{ display: 'block' }}>SAVE ALL</button>
        <br />
        <Link to={`/polaroid`}>
          <button variant='contained'>Next step: Polaroid</button>
        </Link>
        <hr />


        <canvas ref={downloadCanvasRef} style={{ display: 'none' }}></canvas> {/* Non-display canvas */}

        {/* Vibrance */}
        <div ref={vibranceDisplayRef}>Vibrance: {Math.round(vibrance * 100) / 100}</div>
        <button onClick={() => adjustValue(vibrance, setVibrance, -1, 1, -0.01)}>− Vibrance</button>
        <button onClick={() => adjustValue(vibrance, setVibrance, -1, 1, 0.01)}>+ Vibrance</button>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={vibrance}
          onChange={(e) => { setVibrance(parseFloat(e.target.value)); }}
          style={{ width: '200px' }}
        />
        <button onClick={resetVibrance}>Reset Vibrance</button>

        <hr />
        {/* Brightness */}
        <div ref={brightnessDisplayRef}>Brightness: {Math.round(brightness * 100) / 100}</div>
        <button onClick={() => adjustValue(brightness, setBrightness, -1, 1, -0.01)}>− Brightness</button>
        <button onClick={() => adjustValue(brightness, setBrightness, -1, 1, 0.01)}>+ Brightness</button>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={brightness}
          onChange={(e) => { setBrightness(parseFloat(e.target.value)); }}
          style={{ width: '200px' }}
        />
        <button onClick={resetBrightness}>Reset Brightness</button>

        <hr />
        {/* Saturation */}
        <div ref={saturationDisplayRef}>Saturation: {Math.round(saturation * 100) / 100}</div>
        <button onClick={() => adjustValue(saturation, setSaturation, -1, 1, -0.01)}>− Saturation</button>
        <button onClick={() => adjustValue(saturation, setSaturation, -1, 1, 0.01)}>+ Saturation</button>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={saturation}
          onChange={(e) => { setSaturation(parseFloat(e.target.value)); }}
          style={{ width: '200px' }}
        />
        <button onClick={resetSaturation}>Reset Saturation</button>

        <hr />
        {/* Contrast */}
        <div ref={contrastDisplayRef}>Contrast: {Math.round(contrast * 100) / 100}</div>
        <button onClick={() => adjustValue(contrast, setContrast, -1, 1, -0.01)}>− Contrast</button>
        <button onClick={() => adjustValue(contrast, setContrast, -1, 1, 0.01)}>+ Contrast</button>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={contrast}
          onChange={(e) => { setContrast(parseFloat(e.target.value)); }}
          style={{ width: '200px' }}
        />
        <button onClick={resetContrast}>Reset Contrast</button>
      </div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default AddFilter;