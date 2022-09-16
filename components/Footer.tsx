import Social from './Social'
import Legal from './Legal'
import styles from '@/styles/Layout.module.scss'

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <Legal />
        </footer>
    )
}

export default Footer
