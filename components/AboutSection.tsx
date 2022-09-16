import React from "react";
import styles from "@/styles/AboutSection.module.scss";
import { Grid, Stack, Typography } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';

const AboutSection = () => {

  const checkText = (text) => {
    return (
      <Stack direction='row' className={styles.checkContainer} spacing={'0.7rem'}>
        <CheckIcon className={styles.checkIcon} />
        <Typography className={styles.checkText}>{text}</Typography>
      </Stack>
    )
  }

  return (
    <div className={styles.aboutWrapper}>
      <Stack direction='column' className={styles.aboutInner} spacing={'2.563rem'} >
        <Typography className={styles.aboutTitle}>Why choose zot Image Registry?</Typography>
        <Grid container>
          <Grid item xs={4}>
            <Stack direction='column' spacing={'1.5rem'}>
              {checkText('Security hardening')}
              {checkText('Clear separation between core distribution spec and zot-specific extensions')}
            </Stack>
          </Grid>
          <Grid item xs={4}>
            <Stack direction='column' spacing={'1.5rem'}>
              {checkText('Open Source')}
              {checkText('Suitable for deployments in cloud, bare-metal and embedded devices')}
            </Stack>
          </Grid>
          <Grid item xs={4}>
            <Stack direction='column' spacing={'1.5rem'}>
              {checkText('Single binary with many features ')}
              {checkText('Software supply chain security-supports cosign and notation')}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </div>
  );
};

export default AboutSection;
