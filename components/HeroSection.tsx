import React from 'react'
import ExportedImage from 'next-image-export-optimizer'
import styles from '@/styles/HeroSection.module.scss'
import { Button, Stack, Typography } from '@mui/material'
import Header from './Header'
import Link from 'next/link'


const HeroSection = () => {
    return (
        <>
            <Stack className={styles.heroWrapper} direction='column'>
                <Header/>
                <div className={styles.heroImage}>
                    <ExportedImage src={'images/Hero-zui-preview.png'} height={672} width={806} alt="zui-home" />
                </div>

                <Stack className={styles.heroInteraction} direction='column'>
                    <Typography className={styles.heroText}>A production-ready vendor-neutral OCI image registry server purely based on OCI standards.</Typography>
                    <Stack className={styles.buttonContainer} direction='row' spacing={4}>
                        <Button disableRipple disableFocusRipple size='large' variant='contained' className={styles.getStartedButton}>
                            <a className={styles.buttonLink} href='http://zotregistry.io/docs-zot/zot-docs-1/1.0/install-guides/install-guide-linux.html'>
                            Get started
                            </a>
                        </Button>
                        <Button disableRipple  disableFocusRipple variant='outlined' className={styles.learnMoreButton}>
                            <a className={styles.buttonLink} href='http://zotregistry.io/docs-zot/zot-docs-1/1.0/general/zot-concepts.html'>
                            Learn more
                            </a>        
                        </Button>
                    </Stack>
                </Stack>
            </Stack>
        </>
    )
}

export default HeroSection
