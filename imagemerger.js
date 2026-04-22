import React, { useState } from "react";
import {
  Box, Stack, Button, Typography, Slider, IconButton, CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import LayersIcon from "@mui/icons-material/Layers";
import TuneIcon from "@mui/icons-material/Tune";

export default function ImageMerger() {
  const [fg, setFg] = useState(null);     // Foreground image
  const [bg, setBg] = useState(null);     // Background image
  const [mergedImg, setMergedImg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Editing controls
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [sharpness, setSharpness] = useState(1);

  // Upload handler
  const handleUpload = (setFile) => (e) => {
    const file = e.target.files[0];
    if (file) setFile(file);
  };

  // Merge & send to backend
  const handleMerge = async () => {
    if (!fg || !bg) return alert("Upload both images first!");
    setLoading(true);
    const form = new FormData();
    form.append("foreground", fg);
    form.append("background", bg);
    form.append("brightness", brightness);
    form.append("contrast", contrast);
    form.append("saturation", saturation);
    form.append("sharpness", sharpness);

    try {
      const resp = await fetch("http://localhost:5000/api/merge", {
        method: "POST",
        body: form,
      });
      if (!resp.ok) throw new Error("Merge failed");
      const blob = await resp.blob();
      setMergedImg(URL.createObjectURL(blob));
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      bgcolor: "linear-gradient(120deg,#e1ffea,#aee1ff)",
      minHeight: "100vh", p: 3 }}>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
        <Typography variant="h4" fontWeight="bold" align="center" mb={2}>
          <LayersIcon fontSize="large" /> AI Image Merger
        </Typography>
      </motion.div>
      <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
        <Box textAlign="center">
          <input accept="image/*" type="file" id="fg-upload" style={{ display: "none" }} onChange={handleUpload(setFg)} />
          <label htmlFor="fg-upload">
            <Button variant="contained" color="primary" startIcon={<AddPhotoAlternateIcon />}>
              Upload Foreground
            </Button>
          </label>
          {fg && (
            <motion.img src={URL.createObjectURL(fg)} alt="fg" width={120}
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ marginTop: 8, borderRadius: 8, boxShadow: "0 0 10px #b2f" }} />
          )}
        </Box>
        <Box textAlign="center">
          <input accept="image/*" type="file" id="bg-upload" style={{ display: "none" }} onChange={handleUpload(setBg)} />
          <label htmlFor="bg-upload">
            <Button variant="contained" color="secondary" startIcon={<AddPhotoAlternateIcon />}>
              Upload Background
            </Button>
          </label>
          {bg && (
            <motion.img src={URL.createObjectURL(bg)} alt="bg" width={120}
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ marginTop: 8, borderRadius: 8, boxShadow: "0 0 10px #2cf" }} />
          )}
        </Box>
      </Stack>

      <Box sx={{ maxWidth: 420, mx: "auto", bgcolor: "#fff2", p: 3, borderRadius: 4, boxShadow: 3 }}>
        <Typography align="center" variant="subtitle1" fontWeight="bold" mb={1}>
          Fine Tune AI Merge <TuneIcon />
        </Typography>
        {[
          ["Brightness", brightness, setBrightness, 0.6, 1.8, 0.01],
          ["Contrast", contrast, setContrast, 0.6, 1.8, 0.01],
          ["Saturation", saturation, setSaturation, 0.5, 2.0, 0.01],
          ["Sharpness", sharpness, setSharpness, 0.4, 2.0, 0.01],
        ].map(([label, val, setter, min, max, step]) => (
          <Box key={label} mb={2}>
            <Typography>{label}: {val.toFixed(2)}</Typography>
            <Slider value={val} min={min} max={max} step={step} onChange={(_, v) => setter(v)} />
          </Box>
        ))}
        <Box textAlign="center" mt={2}>
          <Button
            variant="contained"
            sx={{ px: 5, py: 1.5, borderRadius: 2, fontWeight: "bold", fontSize: 18 }}
            onClick={handleMerge}
            disabled={loading}
            endIcon={<LayersIcon />}
          >
            {loading ? <CircularProgress size={26} /> : "Merge AI Images"}
          </Button>
        </Box>
      </Box>

      <Box mt={4} textAlign="center">
        <Typography variant="h6" mb={2}>Merged Output:</Typography>
        <AnimatePresence>
          {mergedImg && (
            <motion.img src={mergedImg} width={340}
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              style={{ borderRadius: 18, boxShadow: "0 0 30px #27f", margin: "auto" }} />
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
