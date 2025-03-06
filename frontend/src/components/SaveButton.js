import { fetchFirestoreDoc, addToFirestoreArray } from "../utils/firebaseUtils";

const SaveButton = ({ currentUser, recipeId, size = 32, className }) => {
    const handleSaveRecipe = async () => {
      if (!currentUser) {
        console.error("User not logged in");
        return;
      }
  
      try {
        await addToFirestoreArray("users", currentUser.uid, "savedRecipes", recipeId);
        console.log("Recipe saved successfully!");
      } catch (error) {
        console.error("Error saving recipe:", error);
      }
    };
  
    return (
      <button
        onClick={handleSaveRecipe}
        className={`relative ${className}`}
        style={{ width: size, height: size }}
      >
        {/* Ellipse Image */}
        <img src="/images/ellipse.png" alt="Save" className="w-full h-full" />
        
        {/* Save Icon */}
        <img
          src="/images/save_unfilled.png"
          alt="Save Icon"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ width: size * 0.5 }}
        />
      </button>
    );
  };
  
  export default SaveButton;