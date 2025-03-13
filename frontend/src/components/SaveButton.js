import { useEffect, useState } from "react";
import { fetchFirestoreDoc, addToFirestoreArray, removeFromFirestoreArray } from "../utils/firebaseUtils";
import { getAuth } from "firebase/auth";

const SaveButton = ({recipeId, size = 32, className }) => {
  const [isSaved, setIsSaved] = useState(false);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!currentUser) return;

      try {
        const userData = await fetchFirestoreDoc("users", currentUser.uid);
        if (userData?.savedRecipes?.includes(recipeId)) {
          setIsSaved(true);
        } else {
          setIsSaved(false);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    checkIfSaved();
  }, [currentUser, recipeId]);

  const handleToggleSave = async () => {
    if (!currentUser) {
      console.error("User not logged in");
      return;
    }

    try {
      if (isSaved) {
        await removeFromFirestoreArray("users", currentUser.uid, "savedRecipes", recipeId);
        console.log("Recipe unsaved");
        setIsSaved(false);
      } else {
        await addToFirestoreArray("users", currentUser.uid, "savedRecipes", recipeId);
        console.log("Recipe saved");
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling save state:", error);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ellipse Image */}
      <img src="/images/ellipse.png" alt="Save" className="w-full h-full" />

      {/* Save Icon (filled or unfilled) */}
      <img
        src={isSaved ? "/images/save.png" : "/images/save_unfilled.png"}
        alt="Save Icon"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{ width: size * 0.5 }}
      />
    </button>
  );
};

export default SaveButton;
