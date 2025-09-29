const uploadToCloudinary = jest.fn((buffer, folder) => {
  return Promise.resolve({
    secure_url: 'https://res.cloudinary.com/demo/image/upload/mock_image.jpg',
    public_id: 'mock_public_id',
  });
});

const deleteFromCloudinary = jest.fn((publicId) => {
  return Promise.resolve({ result: 'ok' });
});

module.exports = { uploadToCloudinary, deleteFromCloudinary };
