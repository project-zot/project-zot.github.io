import Head from 'next/head'

const defaultTitle = 'zot Registry';
const defaultKeywords = 'zot, project-zot, images, registry, container';
const defaultDescription = `zot image registry`;

const Meta = ({ title, keywords, description }) => {
    return (
        <Head>
            <meta name='viewport' content='width=device-width, initial-scale=1'></meta>
            <meta name='keywords' content={keywords}></meta>
            <meta name='description' content={description}></meta>
            <meta charSet='utf-8' />
            <link rel='icon' href='/favicon.ico' />
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
            <title>{defaultTitle}</title>
        </Head>
    )
}

Meta.defaultProps = {
    title: defaultTitle,
    keywords: defaultKeywords,
    description: defaultDescription,
}

export default Meta
