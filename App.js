import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ImageIcon from "@mui/icons-material/Image";
import BackupIcon from "@mui/icons-material/Backup";

const defaultBackgrounds = [
  { id: "beach", name: "Beach", url: "/backgrounds/beach.jpg" },
  { id: "forest", name: "Forest", url: "/backgrounds/forest.jpg" },
  { id: "mountains", name: "Mountains", url: "/backgrounds/mountains.jpg" },
];

export default function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [editedImage, setEditedImage] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [customBackground, setCustomBackground] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle uploading custom background
  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setCustomBackground(file);
      setSelectedBackground("custom");
    }
  };

  // Handle uploading original image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setOriginalImage(file);
      setEditedImage(null);
    }
  };

  // Send both images to backend
  const processImage = async () => {
    if (!originalImage) {
      alert("Please upload your image first.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("image", originalImage);

    if (selectedBackground === "custom" && customBackground) {
      formData.append("customBackground", customBackground);
    } else if (selectedBackground) {
      formData.append("backgroundId", selectedBackground);
    }

    try {
      const response = await fetch("http://localhost:5000/api/process", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Process failed.");
      const blob = await response.blob();
      setEditedImage(URL.createObjectURL(blob));
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "linear-gradient(135deg,#a8edea,#fed6e3)" }}>
      <motion.div
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <Typography
          variant="h3"
          align="center"
          sx={{
            pt: 5,
            color: "#333",
            fontWeight: "bold",
            fontFamily: "Arial Rounded MT Bold",
            letterSpacing: "2px",
            textShadow: "2px 2px 8px #fff,0px 2px 20px #81e6d9",
          }}
        >
          🎨 AI Magic Background Editor
        </Typography>
        <Typography align="center" variant="h6" sx={{ color: "#789", mb: 3 }}>
          Remove, replace or animate your memories!
        </Typography>
      </motion.div>

      {/* Upload Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <Box textAlign="center" mb={2}>
          <input
            accept="image/*"
            type="file"
            style={{ display: "none" }}
            id="upload-input"
            onChange={handleImageUpload}
          />
          <label htmlFor="upload-input">
            <Button
              variant="contained"
              component="span"
              size="large"
              startIcon={<AddPhotoAlternateIcon />}
              sx={{
                bgcolor: "#81e6d9",
                color: "#fff",
                boxShadow: 4,
                fontSize: 18,
                p: 2,
                mt: 2,
                mb: 2,
              }}
            >
              Upload Your Photo
            </Button>
          </label>
        </Box>
      </motion.div>

      {/* Animated Preview */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center" justifyContent="center">
        <Box textAlign="center">
          <Typography variant="subtitle2">Original</Typography>
          <AnimatePresence>
            {originalImage && (
              <motion.img
                key="orig"
                src={URL.createObjectURL(originalImage)}
                alt="original"
                style={{ maxWidth: 240, borderRadius: "18px", boxShadow: "0 0 16px #bbf" }}
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -80, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </AnimatePresence>
        </Box>
        <Box textAlign="center">
          <Typography variant="subtitle2">Edited</Typography>
          <AnimatePresence>
            {loading && <CircularProgress color="primary" />}
            {editedImage && !loading && (
              <motion.img
                key="edit"
                src={editedImage}
                alt="edited"
                style={{ maxWidth: 240, borderRadius: "18px", boxShadow: "0 0 24px #fbf" }}
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 80, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </AnimatePresence>
        </Box>
      </Stack>

      {/* Background Selector */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Typography variant="h5" align="center" sx={{ mt: 5 }}>
          Select or Add Background:
        </Typography>
        <Stack direction="row" spacing={4} justifyContent="center" alignItems="center" mt={2}>
          {defaultBackgrounds.map((bg) => (
            <Box key={bg.id} sx={{ textAlign: "center" }}>
              <motion.img
                src={bg.url}
                alt={bg.name}
                width={120}
                style={{
                  border: selectedBackground === bg.id ? "3px solid #38b2ac" : "1px solid #aaa",
                  borderRadius: "12px",
                  cursor: "pointer",
                  boxShadow: selectedBackground === bg.id ? "0 0 22px #63c" : "none"
                }}
                whileHover={{ scale: 1.09 }}
                onClick={() => setSelectedBackground(bg.id)}
              />
              <Typography variant="caption">{bg.name}</Typography>
            </Box>
          ))}
          {/* Custom upload */}
          <Box>
            <input
              accept="image/*"
              type="file"
              style={{ display: "none" }}
              id="bg-upload"
              onChange={handleBgUpload}
            />
            <label htmlFor="bg-upload">
              <IconButton
                component="span"
                sx={{
                  bgcolor: selectedBackground === "custom" ? "#805ad5" : "#e2e8f0",
                  p: 4,
                  fontSize: 40,
                  color: "#fff",
                  boxShadow: selectedBackground === "custom" ? 8 : 1,
                  borderRadius: 3,
                  mt: 0.5,
                }}
              >
                <BackupIcon fontSize="large" />
              </IconButton>
            </label>
            <Typography variant="caption">Custom</Typography>
          </Box>
        </Stack>
      </motion.div>

      {/* Animate button */}
      <Box textAlign="center" mt={5}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              fontWeight: "bold",
              fontSize: 22,
              bgcolor: "#805ad5",
              boxShadow: "0 4px 16px #805ad511",
              letterSpacing: 2,
              px: 6, py: 2,
            }}
            onClick={processImage}
            disabled={loading}
            startIcon={<ImageIcon />}
          >
            {loading ? "Processing..." : "Apply Magic"}
          </Button>
        </motion.div>
      </Box>
    </Box>
  );
}
