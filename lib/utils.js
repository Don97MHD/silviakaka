export const getRecipePageLink = (pageNumber) => {
    if (parseInt(pageNumber, 10) <= 1) { // Ensure pageNumber is treated as a number
        return '/recept'; // Page 1 is just /recept
    }
    return `/recept/list/${pageNumber}`; // Pages 2+ are /recept/list/X
};