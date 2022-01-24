import { logger } from './logger'
import * as semver from 'semver'
import { exec } from "child_process"
import { promisify } from "util"
import { DockerClientJSONTags } from "./types"

export const getTag = async (repository: string, pattern: string, 
        tagList?: string[]): Promise<string | undefined> => {
    logger.debug(`Getting latest tag matching ${repository}:${pattern}`)
    if (tagList == null) {
        tagList = await pullTagsFromRepository(repository)
    }

    return getLatestQualifyingTag(pattern, tagList)
}

const getLatestQualifyingTag = (pattern: string, activeTags: string[]): string | undefined => {
    logger.debug(`Total active tags: ${activeTags}`)

    const coercedPattern = coerceDockerPattern(pattern)
    if (coercedPattern == null) {
        logger.info(`Pattern ${pattern} not semver, no qualifying tags`)
        return null
    }

    logger.debug(`pattern coerced from ${pattern} to ${coercedPattern}`)
    let latestQualifyingTag = null
    for(const tag of activeTags) {
        // if tag matches exactly, return that straight away
        if (tag == pattern) {
            return tag
        }

        const coercedTag = semver.coerce(tag)
        if (coercedTag == null) {
            logger.debug(`skipping tag ${tag} which we can't coerce`)
            continue
        }

        // Is the tag <= our pattern?
        logger.debug(`Evaluating tag ${tag} (coerced to ${coercedTag})`)
        if (!semver.gt(coercedTag, coercedPattern)) {
            logger.debug(`tag ${tag} (coerced to ${coercedTag} <= pattern ${pattern} (coerced to ${coercedPattern}))`)
            // Is the tag newer than our latest qualifying tag?
            if (latestQualifyingTag == null || semver.gt(coercedTag, semver.coerce(latestQualifyingTag))) {
                logger.debug(`tag ${tag} is newer than latestQualifyingTag ${latestQualifyingTag}`)
                latestQualifyingTag = tag
            }
        }
    }

    logger.debug(`result qualifying tag is ${latestQualifyingTag}`)
    return latestQualifyingTag
}

const coerceDockerPattern = (pattern: string) => {
    const MAX_REV = "999999"
    if (/^\d+$/.test(pattern)) {
        return `${pattern}.${MAX_REV}.${MAX_REV}`
    }

    if (/^\d+\.\d+$/.test(pattern)) {
        return `${pattern}.${MAX_REV}`
    }

    if (/^\d+\.\d+\.\d+$/.test(pattern)) {
        return pattern
    }

    return null
}


const pullTagsFromRepository = async (repository: string) => {
    const DIR = "/node-docker-registry-client"
    const pExec = promisify(exec)
    const { stdout, stderr } = await pExec(`node ${DIR}/examples/v2/listTags.js ${repository}`)
    if (stderr) {
        logger.error(`Error: ${stderr}`)
    }

    const json: DockerClientJSONTags = JSON.parse(stdout)
    logger.debug("JSON from repository for %s: %O", repository, json)
    return json.tags
}
