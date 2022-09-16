import Link from 'next/link'

const Social = () => {
    return (
        <div>
            <ul>
                <li>
                    <Link href='https://slack.com/'>
                        {/* <a><ExportedImage  alt="Slack Logo" width={40} height={40} /></a> */}
                    </Link>
                </li>
                <li>
                    <Link href='https://twitter.com/Cisco/'>
                        {/* <a><ExportedImage  alt="Twitter Logo" width={49} height={40} /></a> */}
                    </Link>
                </li>
                <li>
                    <Link href='https://github.com/'>
                        {/* <a><ExportedImage alt="Github Logo" width={41} height={40} /></a> */}
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default Social
