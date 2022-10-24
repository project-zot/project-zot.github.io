import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "@/styles/Header.module.scss";
import ExportedImage from "next-image-export-optimizer";
import { Divider, Stack } from "@mui/material";
import zotLogo from '../public/images/zot-white.svg';
import ghLogo from '../public/images/github-white.svg';
import twLogo from '../public/images/twitter_new.svg';
import slLogo from '../public/images/slack.svg';


const Header = (props) => {
  const { visibleMobileNav, setVisibleMobileNav } = props;
  const [navClasses, setNavClasses] = useState([styles.nav]);

  useEffect(() => {
    if (visibleMobileNav) {
      setNavClasses([styles.nav]);
    } else {
      setNavClasses([styles.nav, styles.shadow]);
    }
  }, [visibleMobileNav]);

  return (
    <nav className={navClasses.join(' ')}>
        <div className={styles.innercontainer}>
            <div className={styles.clogo}>
                <Link href='/'><ExportedImage src={zotLogo} alt="zot Logo" layout="responsive" /></Link>
            </div>
            <div className={styles.inputcontainer}>
                <Stack className={styles.linksbar} direction="row" spacing={2}>
                    <Link href='https://zothub.io/' ><a className={styles.textLink} target="_blank">zothub</a></Link>
                    <Link href='http://zotregistry.io/docs-zot/zot-docs-1/1.0/toc/zot-toc.html' ><a className={styles.textLink}>docs</a></Link>
                    <Link href='https://docs.zotregistry.io/zot-docs-1/1.0/toc/zot-toc.html#_articles' ><a className={styles.textLink}>blog</a></Link>
                    <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 3, borderColor:'white' }} />
                    <div className={styles.ghlogo}>
                      <Link href='https://github.com/project-zot/zot' >
                          <a target="_blank"><ExportedImage src={ghLogo} alt="Github Logo" layout="responsive" /></a>
                      </Link>
                    </div>
                    <div className={styles.twlogo}>
                      <Link href='https://twitter.com/zotproject'>
                          <a target="_blank"><ExportedImage src={twLogo} alt="Twitter Logo" layout="responsive" /></a>
                      </Link>
                    </div>
                    <div className={styles.sllogo}>
                      <Link href='https://cloud-native.slack.com/archives/C03EGRE4QGH'>
                          <a target="_blank"><ExportedImage src={slLogo} alt="Slack Logo" layout="fill" /></a>
                      </Link>
                    </div>
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
          <Link href="https://docs.zotregistry.io">
            <a onClick={onMobileLinkClickHandler}>Docs</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
