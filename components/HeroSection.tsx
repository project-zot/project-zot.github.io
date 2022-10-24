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

import heroImage from '../public/images/Hero-zui-preview.png';

const HeroSection = () => {
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

  return (
    <Grid className={styles.heroWrapper}>
      <Header />

      <Grid container spacing={3} className={styles.heroContentWrapper}>
        <Grid container item xs={4} md={4} className={styles.heroInteraction}>
          <Grid item>
            <Typography className={styles.heroText}>
              OCI-native container image registry made easy!              
            </Typography>
          </Grid>
          <Grid item container className={styles.buttonContainer}>
            <Stack direction="row" spacing={3}>
              <a
                className={styles.buttonLink}
                href="http://zotregistry.io/docs-zot/zot-docs-1/1.0/install-guides/install-guide-linux.html"
              >
                <Button
                  disableRipple
                  disableFocusRipple
                  size="large"
                  variant="contained"
                  className={styles.getStartedButton}
                >
                  Get started
                </Button>
              </a>
              <a
                className={styles.buttonLink}
                href="https://docs.zotregistry.io/zot-docs-1/1.0/admin-guide/admin-guide.html"
              >
                <Button
                  disableRipple
                  disableFocusRipple
                  variant="outlined"
                  className={styles.learnMoreButton}
                >
                  Learn more
                </Button>
              </a>
            </Stack>
          </Grid>
        </Grid>

        <Grid item xs={4} md={4} className={styles.heroImage}>
          <ExportedImage
            src={heroImage}
            layout="responsive"
            alt="zui-home"
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HeroSection;
