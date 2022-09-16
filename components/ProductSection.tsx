import React from "react";
import ExportedImage from "next-image-export-optimizer";
import styles from "@/styles/ProductSection.module.scss";
import { Button, Stack, Typography } from "@mui/material";

const ProductSection = () => {
  return (
    <>
      <div style={{position:'relative'}}>
        <div className={styles.productImage}>
          <ExportedImage
            src={"images/Product-zui-preview.png"}
            height={385}
            width={504}
            alt="zui-explore"
          />
        </div>
      </div>
      <Stack direction="column" className={styles.productContainer} spacing={4}>
        <Typography className={styles.productTitle}>What is zot?</Typography>
        <Typography className={styles.productTextBlock}>
          There are two broad trends occurring currently in how we build,
          distribute and consume software. The first one is the increasing
          adoption of container technologies. The second one is that we no
          longer build everything from scratch but compose our software
          solutions from various sources but, this also raises the important
          question of software provenance and supply chain security.
        </Typography>
        <Typography className={styles.productTextBlock}>
          Zot intends to play an important role in this regard. At its heart,
          zot is a production-ready vendor-neutral OCI image registry with
          images stored in OCI image format, distribution specification
          on-the-wire, that&apos;s it!
        </Typography>
        <Stack direction="row" spacing={3} className={styles.buttonContainer}>
          <Button variant="contained" className={styles.howItWorksButton}>
            How it works
          </Button>
          <Button variant="outlined" className={styles.specsLink}>
            More details
          </Button>
        </Stack>
      </Stack>
    </>
  );
};

export default ProductSection;
