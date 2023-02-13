import fs from 'fs'
import glob from 'glob'
import matter from 'gray-matter'
import marked from 'marked'
import mkdirp from 'mkdirp'
import path from 'path'
import ncp from 'ncp'
import inflection from 'inflection'

const readFile = (filename) => {
	const rawFile = fs.readFileSync(filename, 'utf8')
	const { content, ...data } = matter(rawFile)
	const html = marked(content)

	return { ...data, html }
}

const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

const generateNavigationLinks = (template, pageFilenames) => {
	let navigation = '<ul class="navbar-nav ms-auto py-4 py-lg-0">'

	pageFilenames.forEach(function (filename) {
		const pageTitle = getFileNameWithoutExtension(filename)
		navigation += `<li class="nav-item"><a class="nav-link px-lg-3 py-3 py-lg-4" href="${getFileNameWithoutExtension(
			filename
		)}.html">${capitalizeFirstLetter(pageTitle)}</a></li>`
	})

	navigation += '</ul>'

	return template.replace(/{{ NAVIGATION }}/g, navigation)
}

const renderPageTemplate = (template, data, filename, filenames) => {
	const { html } = data
	const { date, title, author } = data.data
	template = generateNavigationLinks(template, filenames)
	return template
		.replace(/{{ PAGE_TITLE }}/g, capitalizeFirstLetter(filename))
		.replace(/{{ AUTHOR }}/g, author)
		.replace(/{{ PUBLISH_DATE }}/g, date)
		.replace(/{{ TITLE }}/g, title)
		.replace(/{{ CONTENT }}/g, html)
}

const saveFile = (filename, contents) => {
	const dir = path.dirname(filename)
	mkdirp.sync(dir)
	fs.writeFileSync(filename, contents)
}

const getOutputFilename = (filename, outPath) =>
	path.join(outPath, path.basename(filename).replace(/\.md$/, '.html'))

const getFileNameWithoutExtension = (filename) => path.basename(filename).replace(/\.md$/, '')
 
const processFile = (filename, filenames, template, outPath) => {
	const file = readFile(filename)
	const outputFileName = getOutputFilename(filename, outPath)
	const pageTitle = getFileNameWithoutExtension(filename)
	const renderedPageTemplate = renderPageTemplate(template, file, pageTitle, filenames)

	saveFile(outputFileName, renderedPageTemplate)
	console.log(`📝 ${outputFileName}`)
}

const processMarkdownFile = (fileName, subDirectoryName) => {
  const file = readFile(fileName);
  const partialTemplate = fs.readFileSync(
    path.join('src', 'template', 'partial', `${inflection.singularize(subDirectoryName)}.html`),
    'utf8'
  );
  const partialRendered = renderPageTemplate(partialTemplate, file, '', []);
  return partialRendered;
}

const renderSinglePost = (subDirectoryName, partialRendered) => {
  const singlePostTemplate = fs.readFileSync(
    path.join('src', 'template', `${inflection.singularize(subDirectoryName)}.html`),
    'utf8'
  );
  const singlePostRendered = renderPageTemplate(
    singlePostTemplate,
    {
      html: partialRendered,
      data: {
        title: '',
        date: '',
        author: '',
      },
    },
    'Details',
    []
  );
  return singlePostRendered;
}

const saveSinglePost = (subDirectoryName, singlePostRendered, fileName) => {
  const outputFileName = getOutputFilename(fileName, path.join('dist', subDirectoryName));
  saveFile(outputFileName, singlePostRendered);
  console.log(`📝 ${outputFileName}`);
}

const renderAllPosts = (subDirectoryName, partialRenderedTemplates) => {
  const allPostsTemplate = fs.readFileSync(
    path.join('src', 'template', `${subDirectoryName}.html`),
    'utf8'
  );
  const allPostsRendered = renderPageTemplate(
    allPostsTemplate,
    {
      html: partialRenderedTemplates.join(''),
      data: {
        title: '',
        date: '',
        author: '',
      },
    },
    subDirectoryName,
    []
  );
  return allPostsRendered;
};

const saveAllPosts = (subDirectoryName, allPostsRendered) => {
  const outputFileName = path.join('dist', `${subDirectoryName}.html`);
  saveFile(outputFileName, allPostsRendered);
};

const processSubDirectories = (subDirectoryNames) => {
  subDirectoryNames.forEach((subDirectoryName) => {
    const subDirectoryPath = path.join('src', 'pages', subDirectoryName);
    const subDirectoryFilenames = glob.sync(path.join(subDirectoryPath, '*.md'));
    const partialRenderedTemplates = [];

    subDirectoryFilenames.forEach((fileName) => {
      const partialRendered = processMarkdownFile(fileName, subDirectoryName);
      partialRenderedTemplates.push(partialRendered);

      const singlePostRendered = renderSinglePost(subDirectoryName, partialRendered);
      saveSinglePost(subDirectoryName, singlePostRendered, fileName);
    });

    const allPostsRendered = renderAllPosts(subDirectoryName, partialRenderedTemplates);
	  saveAllPosts(subDirectoryName, allPostsRendered);
  });
}
	

const copyTemplateAssets = (srcPath, outPath) => {
	const assetsPath = path.join(srcPath, 'template/assets')

	ncp(assetsPath, path.join(outPath, 'assets'), (err) => {
		if (err) {
			return console.error(err)
		}
		console.log(
			`📂 All assets from ${assetsPath} have been copied to ${path.join(
				outPath,
				'assets'
			)}.`
		)
	})
}

const main = () => {
	const srcPath = path.resolve('src')
	const outPath = path.resolve('dist')
	const filenames = glob.sync(path.join(srcPath, 'pages/*.md'))

	filenames.forEach(function (filename) {
		const file = readFile(filename)
		const template = fs.readFileSync(
			path.join(srcPath, `template/${file.data.template}`),
			'utf8'
		)
		processFile(filename, filenames, template, outPath)
	})

	const subDirectoryNames = glob
		.sync(path.join(srcPath, 'pages/*/'))
		.map((directoryPath) => path.basename(directoryPath.slice(0, -1)))
	
	processSubDirectories(subDirectoryNames)

	copyTemplateAssets(srcPath, outPath)
}

main()
