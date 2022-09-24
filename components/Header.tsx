import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "@/styles/Header.module.scss";
import ExportedImage from "next-image-export-optimizer";
import { Divider, Stack } from "@mui/material";
import remToPx from '../utils/imageSizeConverter';

const Header = (props) => {
  const { visibleMobileNav, setVisibleMobileNav } = props;
  const [navClasses, setNavClasses] = useState([styles.nav]);
  const zotLogoSize = useRef({w:142.55,h:42});
  const githubLogoSize = useRef({w:24,h:24});
  const twitterLogoSize = useRef({w:30,h:24});
  const slackLogoSize = useRef({w:24,h:24});


  useEffect(() => {
    if (visibleMobileNav) {
      setNavClasses([styles.nav]);
    } else {
      setNavClasses([styles.nav, styles.shadow]);
    }
  }, [visibleMobileNav]);

  useEffect(() => {
    zotLogoSize.current = {w:remToPx(8.909), h:remToPx(2.625)};
    githubLogoSize.current = {w:remToPx(1.5), h:remToPx(1.5)}
    twitterLogoSize.current = {w:remToPx(1.875), h:remToPx(1.5)}
    slackLogoSize.current = {w:remToPx(1.5), h:remToPx(1.5)}
  },[]);

  return (
    <nav className={navClasses.join(' ')}>
        <div className={styles.innercontainer}>
            <div className={styles.clogo}>
                <Link href='/'><ExportedImage src={'images/zot-white.svg'} alt="zot Logo" width={zotLogoSize.current.w} height={zotLogoSize.current.h} /></Link>
            </div>
            <div className={styles.inputcontainer}>
                <Stack className={styles.linksbar} direction="row" spacing={2}>
                    <Link href='/' ><a className={styles.textLink} target="_blank">zothub</a></Link>
                    <Link href='http://zotregistry.io/docs-zot/zot-docs-1/1.0/toc/zot-toc.html' ><a className={styles.textLink}>docs</a></Link>
                    <Link href='/' ><a className={styles.textLink}>blog</a></Link>
                    <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 3, borderColor:'white' }} />
                    <Link href='https://github.com/project-zot/zot'>
                        <a target="_blank"><ExportedImage src={'images/github-white.svg'} alt="Github Logo" width={githubLogoSize.current.w} height={githubLogoSize.current.h} /></a>
                    </Link>
                    <Link href='https://twitter.com/zotproject'>
                        <a target="_blank"><ExportedImage src={'images/twitter_new.svg'} alt="Twitter Logo" width={twitterLogoSize.current.w} height={twitterLogoSize.current.h} /></a>
                    </Link>
                    <Link href='https://slack.com/'>
                        <a target="_blank"><ExportedImage src={'images/slack.svg'} alt="Slack Logo" width={slackLogoSize.current.w} height={slackLogoSize.current.h} /></a>
                    </Link>
                </Stack>
            </div>
        </div>
    </nav>
  );
};

export const MobileNav = ({ setVisibleMobileNav }) => {
  const onMobileLinkClickHandler = () => setVisibleMobileNav(false);
  return (
    <div className={styles.mobilenav}>
      <div className={styles.stack}>
        <div className={styles.stackitem}>
          <Link href="https://raulkele.github.io/project-zot-docs/">
            <a onClick={onMobileLinkClickHandler}>Docs</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
