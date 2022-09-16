import Link from 'next/link'
import ExportedImage from 'next-image-export-optimizer'

const Social = () => {
    return (
        <div>
            <ul>
                <li>
                    <Link href='https://slack.com/'>
                        <a><ExportedImage src={'images/slack.svg'} alt="Slack Logo" width={40} height={40} /></a>
                    </Link>
                </li>
                <li>
                    <Link href='https://twitter.com/Cisco/'>
                        <a><ExportedImage src={'images/twitter_new.svg'} alt="Twitter Logo" width={49} height={40} /></a>
                    </Link>
                </li>
                <li>
                    <Link href='https://github.com/'>
                        <a><ExportedImage src={'images/github.svg'} alt="Github Logo" width={41} height={40} /></a>
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default Social
