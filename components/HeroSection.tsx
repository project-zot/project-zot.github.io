import React, { useEffect, useRef } from "react";
import ExportedImage from "next-image-export-optimizer";
import styles from "@/styles/HeroSection.module.scss";
import {
  Button,
  createTheme,
  Grid,
  Container,
  Typography,
  Stack,
} from "@mui/material";
import Header from "./Header";
import remToPx from "utils/imageSizeConverter";

const HeroSection = () => {
  const zuiHomeSize = useRef({ w: 806, h: 672 });

  // for responsive font
  const theme = createTheme();

  theme.typography.h3 = {
    fontSize: "2.5rem",
    "@media (min-width:600px)": {
      fontSize: "1.5rem",
    },
    [theme.breakpoints.up("md")]: {
      fontSize: "2.0rem",
    },
    [theme.breakpoints.up("sm")]: {
        fontSize: "1.5rem",
      },
  };

  useEffect(() => {
    console.log("getting size");
    zuiHomeSize.current = { w: remToPx(42), h: remToPx(50.375) };
    console.log("size after calc", zuiHomeSize);
  }, []);

  return (
    <Grid className={styles.heroWrapper}>
      <Header />

      <Grid container spacing={3} className={styles.heroContentWrapper}>
        <Grid container item xs={4} md={4} className={styles.heroInteraction}>
          <Grid item>
            <Typography className={styles.heroText}>
              A production-ready vendor-neutral OCI image registry server purely
              based on OCI standards.
            </Typography>
          </Grid>
          <Grid
            item
            container
            className={styles.buttonContainer}
          >
            <Stack direction="row" spacing={3}>
              <Button
                disableRipple
                disableFocusRipple
                size="large"
                variant="contained"
                className={styles.getStartedButton}
              >
                <a
                  className={styles.buttonLink}
                  href="http://zotregistry.io/docs-zot/zot-docs-1/1.0/install-guides/install-guide-linux.html"
                >
                  Get started
                </a>
              </Button>
              <Button
                disableRipple
                disableFocusRipple
                variant="outlined"
                className={styles.learnMoreButton}
              >
                <a
                  className={styles.buttonLink}
                  href="http://zotregistry.io/docs-zot/zot-docs-1/1.0/general/zot-concepts.html"
                >
                  Learn more
                </a>
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Grid item xs={4} md={4} className={styles.heroImage}>
          <ExportedImage
            src={"images/Hero-zui-preview.png"}
            height={zuiHomeSize.current.h}
            width={zuiHomeSize.current.w}
            alt="zui-home"
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HeroSection;
