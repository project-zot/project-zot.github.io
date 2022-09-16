import styles from '@/styles/Layout.module.scss'
import { Button } from '@mui/material'

const Legal = () => {
    return (
        <div className={styles.legal}>
            <ul>
                <li>
                    <Button variant="text" disableRipple className={styles.legalButton}>License rights</Button>
                </li>
                <li>
                    <Button  variant="text" disableRipple className={styles.legalButton}>Privacy Policy</Button>
                </li>
                <li>
                    <Button  variant="text" disableRipple className={styles.legalButton}>Copyright</Button>
                </li>
            </ul>
        </div>
    )
}

export default Legal
