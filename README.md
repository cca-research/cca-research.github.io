# Arm CCA Research

> A community-maintained overview of academic research on Arm Confidential
> Compute Architecture.

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
| `year`         | yes      | number          | must match the filename's year        |
| `venue`        | yes      | string          | e.g. conference/workshop short name   |
| `paper`        | yes      | string (URL)   | link to the paper / PDF               |


Optional Fields:
| Field          | Required | Type            | Notes                                |
| -------------- | -------- | --------------- | ------------------------------------- |
| `keywords`     | no       | list of strings | e.g. GPU, accelerator        |
| `hardware`     | no       | list of strings | hardware platform(s) used        |
| `simulation`   | no       | list of strings | simulator(s) used (e.g. gem5, FVP, etc)    |
| `code`         | no       | string (URL)    | link to a code repository             |
| `slides`       | no       | string (URL)    | link to a slide deck                  |
| `video`        | no       | string (URL)    | link to a video repository             |
| `web`          | no       | string (URL)    | link to a website                    |




