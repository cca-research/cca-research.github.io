[![Hugo Github Pages](https://github.com/cca-research/cca-research.github.io/actions/workflows/hugo.yml/badge.svg)](https://github.com/cca-research/cca-research.github.io/actions/workflows/hugo.yml) 
[![Validate papers](https://github.com/cca-research/cca-research.github.io/actions/workflows/validate-papers.yml/badge.svg)](https://github.com/cca-research/cca-research.github.io/actions/workflows/validate-papers.yml)
# CCA Research Index

> A community-maintained overview of academic research on Arm Confidential
> Compute Architecture.  
> https://cca-research.github.io

## Adding a paper

Create a new file at `data/papers/<year>-<id>.yml`, where `<id>` is a name.

See [data/template.yml](data/template.yml) and [data/papers/*](./data/papers) as an example: 

```yml
title: "Paper Title"
authors:
  - Author 1
  - Author 2
institutions:
  - University 1
  - University 2

year: 2025
venue: Short Name of conference
paper: https://github.com/paper.pdf
```

And open a pull request with your new file.

### Fields

| Field          | Required | Type            | Notes                                |
| -------------- | -------- | --------------- | ------------------------------------- |
| `title`        | yes      | string          |                                        |
| `authors`      | yes      | list of strings | at least one                          |
| `institutions` | yes      | list of strings | at least one                          |
| `year`         | yes      | number          | year published        |
| `venue`        | yes      | string          | e.g. conference/workshop short name   |
| `paper`        | yes      | string (URL)   | link to the paper                |


Optional Fields:
| Field          | Required | Type            | Notes                                |
| -------------- | -------- | --------------- | ------------------------------------- |
| `month`        | no       | number          | month, useful to sort papers    |
| `code`         | no       | string (URL)    | link to code             |
| `slides`       | no       | string (URL)    | link to slides                  |
| `web`          | no       | string (URL)    | link to a website                    |




