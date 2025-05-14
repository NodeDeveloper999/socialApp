import axios from 'axios';

export const uploadImagesToCloudinary = async (files) => {
  const urls = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'Socailapp_AWS'); // Replace
    formData.append('cloud_name', 'ds8jwhyoj'); // Replace

    const res = await axios.post(
      'https://api.cloudinary.com/v1_1/ds8jwhyoj/image/upload',
      formData
    );

    urls.push(res.data.secure_url);
  }

  return urls;
};
