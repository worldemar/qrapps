import os


def write_app_info(app_name, readme_file):
    link = f'### [{app_name}](bundles/{app_name}/minibundle.html)\n\n'
    readme_file.write(link.encode('utf-8'))
    app_readme_path = os.path.join('apps', app_name, 'README.md')
    with open(app_readme_path, 'rb') as app_readme:
        readme_file.write(app_readme.read())
        readme_file.write(b'\n')
    qr_code = f'![{app_name}](bundles/{app_name}/qr.svg)\n\n'
    readme_file.write(qr_code.encode('utf-8'))


def main():
    with open('README.md', 'wb') as readme_file:
        with open('README.src', 'rb') as readme_header:
            readme_file.write(readme_header.read())
        for app_name in os.listdir('apps'):
            write_app_info(app_name, readme_file)


if __name__ == '__main__':
    main()
