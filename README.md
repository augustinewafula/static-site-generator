# Static Site Generator
This is a static site generator built using Node.js that takes in Markdown files, processes them and outputs HTML files. The generator takes in a source directory with Markdown files and templates and outputs a destination directory with HTML files.

# Prerequisites
Before using this static site generator, you need to have the following software installed:

* Node.js
* npm

# Project Setup
1. Clone the repository using the command below:

        git clone https://github.com/augustinewafula/static-site-generator.git

2. Install the dependencies using the command below:
    
        npm install

3. Run the command below to generate the HTML files:
    
        npm run build

4. The HTML files will be generated in the dist folder.

# Project Structure
* The `src` directory contains the Markdown files, templates and navigation file.

* The `src/template` directory contains the HTML templates.

* The `dist` directory contains the generated HTML files.

# Adding Content
To add content to the site, create a new Markdown file in the src directory. The Markdown file should contain a YAML front matter section at the top of the file. The front matter should contain the following fields:

* title: The title of the page.

* date: The date the page was published.

* author: The author of the page.

Example:

        ---
        title: My First Blog Post
        date: 02/15/2023
        author: John Doe
        ---

## Generating Single Pages
To generate a single page, create a markdown file in the src/content directory and run the generator with the command `npm run build`

## Generating Blog Pages.
To generate blog pages, create a directory in the src/content directory and place your markdown files in that directory. The directory name will be used as the blog category. Run the generator with the command `npm run build`.

## Customizing Templates
You can customize the HTML templates by modifying the files in the `src/template` directory. The generator uses the `default.html` file as the default template. You can create custom templates by creating a new HTML file in the `src/template` directory and referencing it in your markdown files.

    ---
    template: custom.html
    ---

# Adding Navigation Links
To add navigation links to the site, add the links to the `src/navigation.yml` file. The file should contain a list of links with the following fields:

* `name`: The name of the link.

* `link`: The URL of the link.

Example:

    - name: Home
      link: /
    - name: About
      link: /about
    - name: Contact
      link: /contact

# Conclusion
This static site generator is a simple and flexible solution for generating HTML files from Markdown files. It is highly customizable and can be used to create a wide range of static websites.