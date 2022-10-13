import styles from '@/styles/Layout.module.scss'
import { Button } from '@mui/material'
import Link from 'next/link'

const Legal = () => {
    return (
        <div className={styles.legal}>
            <ul>
                <li>
                    <Button variant="text" disableRipple className={styles.legalButton}>
                        <Link href='https://github.com/project-zot/zot/blob/main/LICENSE'>
                            <a className={styles.legalButton} target="_blank" >
                                License rights
                            </a>
                        </Link>
                    </Button>
                </li>
                <li>
                    <Button  variant="text" disableRipple className={styles.legalButton}>Copyright @{new Date().getFullYear() || '2022'} Cisco Systems</Button>
                </li>
            </ul>
        </div>
    )
}

export default Legal
