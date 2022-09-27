import styles from '@/styles/Layout.module.scss'
import { Button } from '@mui/material'

const Legal = () => {
    return (
        <div className={styles.legal}>
            <ul>
                <li>
                    <Button variant="text" disableRipple className={styles.legalButton}>
                        <a className={styles.legalButton} href='https://github.com/project-zot/zot/blob/main/LICENSE'>
                            License rights
                        </a>
                    </Button>
                </li>
                <li>
                    <Button  variant="text" disableRipple className={styles.legalButton}>Privacy Policy</Button>
                </li>
                <li>
                    <Button  variant="text" disableRipple className={styles.legalButton}>Copyright @2022 Cisco Systmes</Button>
                </li>
            </ul>
        </div>
    )
}

export default Legal
