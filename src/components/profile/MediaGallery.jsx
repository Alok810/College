import React from 'react';

export default function MediaGallery({ posts }) {
  const allMedia = posts.flatMap((post) => {
    let mediaItems = [];
    if (Array.isArray(post.image_urls) && post.image_urls.length > 0) {
      mediaItems = mediaItems.concat(
        post.image_urls.map((url) => ({
          url: url,
          type: url.match(/\.(mp4|webm|ogg|mov)$/i) ? "video" : "image",
        })),
      );
    }
    return mediaItems
      .map((item) => ({ ...item, postId: post._id }))
      .filter((item) => item.url);
  });

  if (allMedia.length === 0) {
    return (
      <div className="p-10 rounded-xl text-center text-gray-500 w-full bg-white shadow-md border border-gray-100">
        <p>No photos or videos found for this user.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl shadow-md border border-gray-100 w-full">
      {allMedia.map((media, index) => (
        <div
          key={`${media.postId}-${index}`}
          className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-200 shadow-sm relative"
        >
          <img
            src={media.url}
            alt={`Gallery image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}