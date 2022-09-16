import PropTypes from 'prop-types'
import styles from '@/styles/DoubleColumn.module.scss'

const DoubleColumn = ({children}) => {
    if (children.length !== 2) throw new Error("DoubleColumn expects exactly two children");
    
    return (
        <div className={styles.wrapper}>
            {children.map((child, index) => <div key={index} className={`${index === 0 ? styles.leftColumn : styles.rightColumn} ${styles.column}`}>{child}</div>)}
        </div>
    )
}

DoubleColumn.propTypes = {
    children: PropTypes.any.isRequired,
}

export default DoubleColumn