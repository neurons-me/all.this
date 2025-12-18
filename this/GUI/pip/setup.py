from setuptools import setup, find_packages

setup(
    name='this.GUI',
    version='0.1.0',
    author='suiGn',
    description='this.GUI library for Python',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url="https://neurons.me",
    packages=find_packages(),
    classifiers=[
        'Programming Language :: Python :: 3',
    ],
    python_requires='>=3.6',
)