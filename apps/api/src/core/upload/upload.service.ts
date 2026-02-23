import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
	constructor() {
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});
	}

	async uploadImage(file: Express.Multer.File, folder: string = 'general') {
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: `sams/${folder}`,
					resource_type: 'image',
				},
				(error, result) => {
					if (error || !result) return reject(error || new Error('Upload failed'));
					resolve({
						url: result.secure_url,
						public_id: result.public_id,
						width: result.width,
						height: result.height,
						format: result.format,
						bytes: result.bytes,
					});
				},
			);
			const readableStream = new Readable();
			readableStream.push(file.buffer);
			readableStream.push(null);
			readableStream.pipe(uploadStream);
		});
	}

	async deleteImage(publicId: string) {
		return cloudinary.uploader.destroy(publicId);
	}
}
