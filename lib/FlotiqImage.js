// No longer needs config.api.url for this function

const getSrc = (
    imageObject, // Expects an object like { url: '/images/recipes/my-image.jpg', alt: 'description' }
    // width and height parameters are kept for compatibility with how components might call it,
    // but for simple local serving, we primarily use imageObject.url.
    // If you implement more advanced local image processing later, these could be used.
    width,
    height,
) => {
    if (imageObject && imageObject.url) {
        // Assuming imageObject.url is already the correct public path (e.g., '/images/recipes/my-image.jpg')
        return imageObject.url;
    }
    // Return a path to a default placeholder image if the imageObject is invalid or missing
    return '/images/placeholder.jpg'; // Ensure you have a placeholder.jpg in public/images/
};

const FlotiqImage = {
    getSrc,
};

export default FlotiqImage;