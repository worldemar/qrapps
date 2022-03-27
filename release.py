import os


def write_app_info(app_name, readme_file):
    link = f'### [{app_name}]({app_name}/minibundle.html)\n\n'
    readme_file.write(link.encode('utf-8'))
    app_readme_path = os.path.join('apps', app_name, 'README.md')
    with open(app_readme_path, 'rb') as app_readme:
        readme_file.write(app_readme.read())
        readme_file.write(b'\n')
    qr_code = f'![{app_name}]({app_name}/qr.svg)\n\n'
    readme_file.write(qr_code.encode('utf-8'))


def main():
    with open(os.path.join('github.io', 'README.md'), 'wb') as readme_pages:
        with open('README.md', 'rb') as readme_github:
            readme_pages.write(readme_github.read())
        for app_name in os.listdir('apps'):
            write_app_info(app_name, readme_pages)


if __name__ == '__main__':
    main()
