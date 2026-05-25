import cloudinary from "./cloudinary.js";

export const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "dabba-users", // optional folder name
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer); // 🔥 IMPORTANT
  });
};
/*import cloudinary from "./cloudinary.js";

export const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "blog_users" },
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        stream.end(buffer);       
    });
};*/