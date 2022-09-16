import PropTypes from 'prop-types'
import DoubleColumn from '@/components/DoubleColumn'

export const Section = ({ index, color, children, doubleColumn = false }) => {
    if (color === undefined) {
        color = index;
    }

    return (
        <section className={`row box box--${color}`}>
            {
                doubleColumn
                    ? (<DoubleColumn>{children}</DoubleColumn>)
                    : (<div className='col'>{children}</div>)
            }
        </section>
    )
}

Section.propTypes = {
    index: PropTypes.number.isRequired,
    children: PropTypes.any.isRequired,
    color: PropTypes.string,
    doubleColumn: PropTypes.bool,
}

export default Section
