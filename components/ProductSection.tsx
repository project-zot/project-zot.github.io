import React, { useEffect, useRef } from "react";
import ExportedImage from "next-image-export-optimizer";
import styles from "@/styles/ProductSection.module.scss";
import { Button, Grid, Stack, Typography } from "@mui/material";
import remToPx from "utils/imageSizeConverter";

const ProductSection = () => {
  const productZuiPreviewSize = useRef({ w: 504, h: 385 });

  useEffect(() => {
    productZuiPreviewSize.current = { w: remToPx(31.5), h: remToPx(24.063) };
  }, []);

  return (
    <Grid container spacing={2} className={styles.productContainer}>
      <Grid
        item
        xs={4}
        md={4}
        className={styles.productImage}
      >
        <ExportedImage
          src={"images/Product-zui-preview.png"}
          height={productZuiPreviewSize.current.h}
          width={productZuiPreviewSize.current.w}
          alt="zui-explore"
        />
      </Grid>
      <Grid container item xs={4} md={5} spacing={4}>
        <Grid item xs={12}>
          <Typography className={styles.productTitle}>What is zot?</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography className={styles.productTextBlock}>
            There are two broad trends occurring currently in how we build,
            distribute and consume software. The first one is the increasing
            adoption of container technologies. The second one is that we no
            longer build everything from scratch but compose our software
            solutions from various sources but, this also raises the important
            question of software provenance and supply chain security.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography className={styles.productTextBlock}>
            Zot intends to play an important role in this regard. At its heart,
            zot is a production-ready vendor-neutral OCI image registry with
            images stored in OCI image format, distribution specification
            on-the-wire, that&apos;s it!
          </Typography>
        </Grid>
        <Grid item xs={12} className={styles.buttonContainer}>
          <Stack direction="row" spacing={3} >
            <Button variant="contained" className={styles.howItWorksButton}>
              How it works
            </Button>
            <Button variant="outlined" className={styles.specsLink}>
              More details
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProductSection;
