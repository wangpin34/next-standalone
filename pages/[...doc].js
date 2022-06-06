import fs from 'fs/promises'
import path from 'path'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const docsFolder = path.resolve('docs')

export default function Doc({markdown}) {
  return <div>
    {markdown}
  </div>
}

export async function getStaticProps(context) {
  try {
    const { params: {doc} } = context
    const filepath = path.join(docsFolder, doc.join(path.sep))
    const fullpath = filepath + '.md'
    const markdown = await fs.readFile(fullpath, 'utf-8')
    return {
      props: {
        markdown
      } // will be passed to the page component as props
    }
  } catch(err) {
    console.error(err)
    return {
      props: {
        
      }
    }
  }
  
}

async function isDir(file) {
  if (!file) {
    return false
  }
  const stats = await fs.stat(file)
  return stats.isDirectory()
}

async function traverFile(file) {
  const files = new Array()
  const folders = new Array()
  const list = new Array()
  list.push(file);
  while (list.length) {
      const f = list.shift()
      if (await isDir(f)) {
        folders.push(f)
        if (!f) {
          console.log(`${f} is undefined`)
        }
        const results = await fs.readdir(f)
        const _files = results.map((r) => path.join(f, r))
        if (_files != null) {
            Array.prototype.push.apply(list, _files)
        }
      } else {
        files.push(f)
      }
  }
  return [files, folders]
}

export async function getStaticPaths() {
  const [files] = await traverFile(docsFolder)
  const paths = files.map( file => {
    const dir = path.dirname(path.relative(docsFolder, file)).split(path.sep).filter(segment => !/^[\\.\t]?$/.test(segment))
    const doc = path.basename(file).replace(path.extname(file), '')
    return { params: { doc: [...dir, doc]}}
  })
  console.log(JSON.stringify(paths))
  return {
    paths,
    fallback: true // false or 'blocking'
  };
}