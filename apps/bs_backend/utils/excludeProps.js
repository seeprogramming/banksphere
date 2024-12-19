const excludeKeys = (keys, obj) => {
    const result = { ...obj }; // Create a shallow copy of the object
    keys.forEach((key) => delete result[key]); // Remove each key from the copy
    return result;
};

module.exports = { excludeKeys };
