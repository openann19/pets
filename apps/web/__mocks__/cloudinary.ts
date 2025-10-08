export const v2 = {
  config: jest.fn(),
  uploader: {
    upload: jest.fn(() => 
      Promise.resolve({
        public_id: 'test_image_123',
        version: 1234567890,
        signature: 'test_signature',
        width: 1024,
        height: 768,
        format: 'jpg',
        resource_type: 'image',
        created_at: '2024-01-01T00:00:00Z',
        tags: [],
        bytes: 123456,
        type: 'upload',
        etag: 'test_etag',
        placeholder: false,
        url: 'http://res.cloudinary.com/test/image/upload/v1234567890/test_image_123.jpg',
        secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test_image_123.jpg',
        original_filename: 'test_image',
      })
    ),
    destroy: jest.fn(() => 
      Promise.resolve({ result: 'ok' })
    ),
    rename: jest.fn(() => 
      Promise.resolve({
        public_id: 'new_test_image_123',
        url: 'https://res.cloudinary.com/test/image/upload/v1234567890/new_test_image_123.jpg',
      })
    ),
    explicit: jest.fn(),
    upload_stream: jest.fn(),
    upload_large: jest.fn(),
    unsigned_upload: jest.fn(),
  },
  api: {
    resources: jest.fn(() => 
      Promise.resolve({
        resources: [],
        rate_limit_allowed: 500,
        rate_limit_reset_at: new Date(),
        rate_limit_remaining: 500,
      })
    ),
    resource: jest.fn(),
    delete_resources: jest.fn(),
    delete_resources_by_prefix: jest.fn(),
    delete_resources_by_tag: jest.fn(),
    delete_all_resources: jest.fn(),
    update: jest.fn(),
    restore: jest.fn(),
  },
  url: jest.fn((publicId: string) => 
    `https://res.cloudinary.com/test/image/upload/${publicId}`
  ),
  image: jest.fn(),
  video: jest.fn(),
};

export default { v2 };