let uploadCounter = 0;

const uploadToCloudinary = jest.fn((buffer, folder) => {
  uploadCounter++;
  return Promise.resolve({
    secure_url: `https://res.cloudinary.com/demo/image/upload/mock_image_${uploadCounter}_${Date.now()}.jpg`,
    public_id: `mock_public_id_${uploadCounter}_${Date.now()}`,
  });
});

const deleteFromCloudinary = jest.fn((publicId) => {
  return Promise.resolve({ result: 'ok' });
});

module.exports = { uploadToCloudinary, deleteFromCloudinary };
