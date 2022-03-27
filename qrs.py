import os
import sys
import argparse
import subprocess


def parse_args():
    parser = argparse.ArgumentParser('Convert HTML page into QR code')
    parser.add_argument('--htmldirs',
                        help='directory with html page directories')
    parser.add_argument('--builddir',
                        help='directory to put bundle and QR code into')
    return parser.parse_args()


def main():
    args = parse_args()

    for package in os.listdir(args.htmldirs):
        print(f'Processing package {package}')
        subprocess.check_call([
            sys.executable, 'qr.py',
            '--htmldir', os.path.join(args.htmldirs, package),
            '--builddir', args.builddir
        ])


if __name__ == '__main__':
    main()
