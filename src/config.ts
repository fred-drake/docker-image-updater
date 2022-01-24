import fs from 'fs'
import yaml from 'js-yaml'

type ConfigContents = {
    images: {
        repository: string
        pattern: string
    }[]
}

export class Config {
    private static instance: Config;

    private contents: ConfigContents
    private constructor() {
        this.load()
    }

    public static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config()
        }

        return Config.instance
    }

    public getContents() {
        return this.contents
    }

    public load(file = "../config/config.yaml") {
        try {
            const fileContents = fs.readFileSync(file, 'utf8')
            this.contents = yaml.load(fileContents);
            console.log(`Loaded configuration from file ${file}`)
        } catch {
            console.log(`Cannot file ${file}, using defaults.`)
            this.contents = { images: [] };
        }
    }
}
