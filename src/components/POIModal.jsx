import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const POIModal = ({ open, handleClose, poiData }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="poi-modal-title"
      aria-describedby="poi-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="poi-modal-title" variant="h6" component="h2">
          POI Details
        </Typography>
        <Typography id="poi-modal-description" sx={{ mt: 2 }}>
          Lugar: {poiData.key}
        </Typography>
        <Typography sx={{ mt: 2 }}>Tipo: {poiData.type}</Typography>
        <Typography sx={{ mt: 2 }}>
          Description: {poiData.description}
        </Typography>
        <Typography sx={{ mt: 2 }}>Direccion:{poiData.address}</Typography>
        <Button onClick={handleClose}>Close</Button>
      </Box>
    </Modal>
  );
};

export default POIModal;
